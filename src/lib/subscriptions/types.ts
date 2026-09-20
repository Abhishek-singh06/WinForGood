/**
 * Subscription types for Digital Heroes Phase 4.
 *
 * NOTE — OPEN DECISIONS:
 *   - Currency and subscription pricing remain STATUS: OPEN DECISION (decision 5).
 *   - Subscription percentage allocated to prize pool remains STATUS: OPEN DECISION (decision 3).
 *   These values must NOT be hardcoded; they are resolved via Stripe configuration
 *   and environment variables only.
 */

/**
 * PRD § 04: Two supported billing intervals.
 * Yearly plan is specified as having a discounted rate (exact amount: OPEN DECISION).
 */
export type SubscriptionPlan = "monthly" | "yearly";

/**
 * Lifecycle statuses drawn from Stripe subscription states plus a platform
 * 'lapsed' state for subscriptions that expired without renewal.
 */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid"
  | "lapsed";

/**
 * Represents a row in the public.subscriptions table.
 */
export interface SubscriptionRecord {
  id: string;
  user_id: string;
  provider: string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  last_stripe_event_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Derived access state computed by the subscription resolver.
 * Decouples the raw Stripe status from the access-control decision.
 */
export interface SubscriptionAccessState {
  /** True when the user has subscriber-level access (active, trialing, or in cancel grace period). */
  hasAccess: boolean;
  /** The raw subscription record, if one exists. */
  subscription: SubscriptionRecord | null;
  /** Friendly label for display in the UI. */
  statusLabel: string;
  /** True when cancel_at_period_end is set but period has not yet ended. */
  inGracePeriod: boolean;
}

/**
 * Standard result wrapper for subscription server actions.
 */
export interface SubscriptionActionResult {
  success: boolean;
  error?: string;
  /** Stripe Checkout Session URL (for createCheckoutSession). */
  url?: string;
  /** Stripe Customer Portal URL (for createPortalSession). */
  portalUrl?: string;
}

/**
 * Configuration structure for pricing display.
 * All amounts come from Stripe or remain undefined if not configured.
 *
 * OPEN DECISION: Currency and exact pricing amounts are unresolved.
 */
export interface PricingConfig {
  monthly: {
    priceId: string | null;
    /** True only when STRIPE_MONTHLY_PRICE_ID is present in env. */
    configured: boolean;
  };
  yearly: {
    priceId: string | null;
    /** True only when STRIPE_YEARLY_PRICE_ID is present in env. */
    configured: boolean;
  };
  /** True when the Stripe publishable key is configured for client-side embedding. */
  stripeConfigured: boolean;
}
