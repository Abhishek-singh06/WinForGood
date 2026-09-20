import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  SubscriptionRecord,
  SubscriptionAccessState,
  PricingConfig,
} from "./types";

/**
 * =========================================================================
 * SUBSCRIPTION RESOLVER
 * =========================================================================
 *
 * This module is the single authoritative source for determining whether a
 * user has active subscriber access. It MUST be used by:
 *   - Dashboard layout (subscription status display)
 *   - Any server action that gates functionality on subscription status
 *
 * CRITICAL CONSTRAINT (PRD architecture):
 *   Admin access is determined INDEPENDENTLY of subscription status.
 *   Never gate admin access on subscription status.
 *   Admin RBAC is managed exclusively via profiles.role.
 *
 * OPEN DECISIONS preserved:
 *   - Pricing currency and amounts (decisions 3, 5): NOT resolved here.
 *   - Prize pool allocation %: NOT resolved here.
 */

// ---------------------------------------------------------------------------
// Internal: fetch raw subscription record for a user
// ---------------------------------------------------------------------------
async function fetchSubscriptionRecord(
  userId: string
): Promise<SubscriptionRecord | null> {
  // Detect placeholder Supabase URL to avoid network calls in test environments
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl.includes("placeholder")) {
    return null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as SubscriptionRecord;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Internal: compute a human-readable status label
// ---------------------------------------------------------------------------
function computeStatusLabel(
  sub: SubscriptionRecord | null,
  hasAccess: boolean
): string {
  if (!sub) return "No Subscription";

  switch (sub.status) {
    case "active":
      return sub.cancel_at_period_end ? "Active (Cancels at Period End)" : "Active";
    case "trialing":
      return "Trial Active";
    case "past_due":
      return "Payment Past Due";
    case "canceled":
      return hasAccess ? "Canceled (Access Until Period End)" : "Canceled";
    case "incomplete":
      return "Awaiting Payment";
    case "unpaid":
      return "Unpaid — Access Suspended";
    case "lapsed":
      return "Subscription Lapsed";
    default:
      return "Unknown Status";
  }
}

// ---------------------------------------------------------------------------
// Internal: determine if the user has access based on subscription record
// ---------------------------------------------------------------------------
function computeHasAccess(sub: SubscriptionRecord | null): boolean {
  if (!sub) return false;

  const now = new Date();

  // Active or trialing: access granted
  if (sub.status === "active" || sub.status === "trialing") {
    // If period end is in the future (or not set), grant access
    if (!sub.current_period_end) return true;
    return new Date(sub.current_period_end) > now;
  }

  // cancel_at_period_end: user retains access until the period ends
  // This applies regardless of whether status is still 'active' or 'canceled'
  if (sub.cancel_at_period_end && sub.current_period_end) {
    return new Date(sub.current_period_end) > now;
  }

  return false;
}

// ---------------------------------------------------------------------------
// PUBLIC API: resolveSubscriptionAccess
// ---------------------------------------------------------------------------
/**
 * Resolves the complete subscription access state for a user.
 *
 * Returns a SubscriptionAccessState with:
 *   - hasAccess: whether the user should be permitted subscriber-level access
 *   - subscription: the raw subscription record (may be null if no subscription)
 *   - statusLabel: human-readable status string for display
 *   - inGracePeriod: whether cancel_at_period_end is active and period not yet ended
 *
 * This function never throws — it returns a safe no-access state on any error.
 */
export async function resolveSubscriptionAccess(
  userId: string
): Promise<SubscriptionAccessState> {
  try {
    const subscription = await fetchSubscriptionRecord(userId);
    const hasAccess = computeHasAccess(subscription);

    const inGracePeriod =
      !!subscription?.cancel_at_period_end &&
      !!subscription.current_period_end &&
      new Date(subscription.current_period_end) > new Date() &&
      !hasAccess === false; // inGracePeriod is a subset of hasAccess when cancel_at_period_end

    const statusLabel = computeStatusLabel(subscription, hasAccess);

    return {
      hasAccess,
      subscription,
      statusLabel,
      inGracePeriod,
    };
  } catch {
    // Safe fallback: no access, no subscription
    return {
      hasAccess: false,
      subscription: null,
      statusLabel: "Unable to determine subscription status",
      inGracePeriod: false,
    };
  }
}

// ---------------------------------------------------------------------------
// PUBLIC API: getPricingConfig
// ---------------------------------------------------------------------------
/**
 * Returns the pricing configuration derived from environment variables.
 *
 * OPEN DECISION: Exact prices and currency are unresolved.
 * This function returns ONLY what is configured — it never invents prices.
 * The UI must display "Pricing Configuration Required" when configured=false.
 */
export function getPricingConfig(): PricingConfig {
  const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID || null;
  const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID || null;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;

  return {
    monthly: {
      priceId: monthlyPriceId,
      configured: !!monthlyPriceId,
    },
    yearly: {
      priceId: yearlyPriceId,
      configured: !!yearlyPriceId,
    },
    stripeConfigured: !!publishableKey && !!process.env.STRIPE_SECRET_KEY,
  };
}
