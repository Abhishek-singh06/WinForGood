-- =============================================================================
-- DIGITAL HEROES — Phase 4: Subscription Billing Foundation
-- Migration: 20260920000003_phase4_subscriptions.sql
-- PRD Reference: § 04 (Subscription & Billing)
-- Business Rules: BR-010 – BR-015
-- =============================================================================
-- NOTE: Exact pricing, currency, and prize-pool split percentage remain
--       STATUS: OPEN DECISION (decisions 3 and 5). This schema does NOT
--       embed any specific monetary values. All monetary values are resolved
--       externally via Stripe product/price configuration and env vars.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUM: subscription_plan
-- Reflects PRD § 04: Monthly and Yearly plans only.
-- ---------------------------------------------------------------------------
CREATE TYPE public.subscription_plan AS ENUM ('monthly', 'yearly');

-- ---------------------------------------------------------------------------
-- ENUM: subscription_status
-- Maps to Stripe subscription lifecycle statuses plus a platform-specific
-- 'lapsed' state for subscriptions that have expired without renewal.
-- ---------------------------------------------------------------------------
CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'unpaid',
  'lapsed'
);

-- ---------------------------------------------------------------------------
-- TABLE: public.subscriptions
-- One subscription record per user. Captures Stripe subscription lifecycle.
-- RLS enforces: subscribers read own row; cannot write status/provider fields.
-- Admins read all rows.
-- ---------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  -- Primary key independent of any Stripe ID
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User link — one active subscription per user (enforced via UNIQUE below)
  user_id                   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Payment provider identifier (always 'stripe' for Phase 4)
  provider                  TEXT NOT NULL DEFAULT 'stripe',

  -- Stripe Customer ID — used to create portal sessions and correlate webhooks
  provider_customer_id      TEXT,

  -- Stripe Subscription ID — used to correlate webhook events
  provider_subscription_id  TEXT UNIQUE,

  -- Plan selected at checkout — monthly or yearly (PRD § 04)
  plan                      public.subscription_plan NOT NULL DEFAULT 'monthly',

  -- Current subscription lifecycle status
  status                    public.subscription_status NOT NULL DEFAULT 'incomplete',

  -- Billing period boundaries — sourced from Stripe event data
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,

  -- If true: subscription cancels at period end, access retained until then
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamp of explicit cancellation request (NOT the access-end date)
  canceled_at               TIMESTAMPTZ,

  -- Idempotency: track the last Stripe event ID processed for this record
  last_stripe_event_id      TEXT,

  -- Audit timestamps
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- CONSTRAINTS & INDEXES
-- ---------------------------------------------------------------------------

-- Each user has at most one subscription record (simplifies resolver logic)
CREATE UNIQUE INDEX subscriptions_user_id_unique
  ON public.subscriptions(user_id);

-- Fast lookup by Stripe customer ID (used in webhook processing)
CREATE INDEX subscriptions_provider_customer_id_idx
  ON public.subscriptions(provider_customer_id)
  WHERE provider_customer_id IS NOT NULL;

-- Fast lookup by Stripe subscription ID (primary webhook correlation key)
CREATE INDEX subscriptions_provider_subscription_id_idx
  ON public.subscriptions(provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL;

-- Fast lookup by status (used by admin queries and access resolvers)
CREATE INDEX subscriptions_status_idx
  ON public.subscriptions(status);

-- Fast lookup by user_id (primary subscriber access resolver path)
CREATE INDEX subscriptions_user_id_idx
  ON public.subscriptions(user_id);

-- ---------------------------------------------------------------------------
-- TRIGGER: Auto-update updated_at on every UPDATE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_subscription_updated_at();

-- ---------------------------------------------------------------------------
-- FUNCTION: public.has_active_subscription(uid UUID)
-- Returns TRUE if the given user has an active or trialing subscription
-- whose period has not yet ended.
-- Used by: dashboard layout server component (subscription access resolver)
-- Security: SECURITY DEFINER with strict search_path
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_active_subscription(uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_record public.subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO sub_record
  FROM public.subscriptions
  WHERE user_id = uid
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Active or trialing with a valid period end is considered accessible
  IF sub_record.status IN ('active', 'trialing') THEN
    IF sub_record.current_period_end IS NULL OR sub_record.current_period_end > now() THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- cancel_at_period_end: user retains access until period end
  IF sub_record.cancel_at_period_end = TRUE
     AND sub_record.current_period_end IS NOT NULL
     AND sub_record.current_period_end > now() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated subscribers can read their own subscription row
CREATE POLICY "subscribers_read_own_subscription"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can read ALL subscription rows
CREATE POLICY "admins_read_all_subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy: Subscribers CANNOT insert or modify subscription rows directly.
-- All writes to this table happen exclusively via server-side webhook handlers
-- using the service role key — bypassing RLS entirely.
-- No INSERT/UPDATE/DELETE policies are granted to any authenticated role.

-- ---------------------------------------------------------------------------
-- FUNCTION: public.is_subscriber_active()
-- Convenience RLS helper returning TRUE if current user's subscription is active.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_subscriber_active()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.has_active_subscription(auth.uid());
END;
$$;

-- ---------------------------------------------------------------------------
-- COMMENTS for DBA reference
-- ---------------------------------------------------------------------------
COMMENT ON TABLE public.subscriptions IS
  'PRD § 04: One record per user tracking Stripe subscription lifecycle. '
  'All mutations occur via service-role webhook handler only (RLS bypass). '
  'OPEN DECISIONS: pricing, currency, and prize-pool split % remain unresolved.';

COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS
  'When TRUE the subscription cancels at current_period_end. '
  'Access remains ACTIVE until that timestamp per PRD § 04 (cancel anytime).';

COMMENT ON COLUMN public.subscriptions.last_stripe_event_id IS
  'Idempotency guard: if a webhook event ID matches this field, the event has '
  'already been processed and must be silently acknowledged without re-applying.';
