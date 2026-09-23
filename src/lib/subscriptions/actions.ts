"use server";

import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { getStripeClient } from "@/lib/stripe/client";
import { resolveSubscriptionAccess, getPricingConfig } from "@/lib/subscriptions/resolver";
import type { SubscriptionActionResult } from "@/lib/subscriptions/types";
import { getAppUrl } from "@/lib/auth/url";

/**
 * =========================================================================
 * SUBSCRIPTION SERVER ACTIONS — Digital Heroes Phase 4
 * PRD Reference: § 04 (Subscription & Billing)
 * Business Rules: BR-010 – BR-015
 * =========================================================================
 *
 * SECURITY RULES ENFORCED:
 *   - STRIPE_SECRET_KEY is server-only. Never returned to client.
 *   - STRIPE_WEBHOOK_SECRET is server-only. Never returned to client.
 *   - Session must be valid before any Stripe operation is initiated.
 *   - Admin access remains INDEPENDENT of subscription status.
 *   - No fake payment success simulation is implemented.
 *
 * OPEN DECISIONS PRESERVED:
 *   - Pricing, currency, discount %: NOT hardcoded. Read from env vars only.
 *   - Prize pool allocation: NOT resolved. Out of scope for Phase 4.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the absolute base URL for constructing Stripe redirect URLs.
 * Uses NEXT_PUBLIC_APP_URL if set, falls back to localhost for development.
 */
function getBaseUrl(): string {
  return getAppUrl();
}

/**
 * Ensures the current user is authenticated before initiating Stripe operations.
 * Returns the user ID or throws a redirect to /login.
 */
async function requireAuthenticatedUser(): Promise<string> {
  const authData = await getCurrentUserAndProfile();
  if (!authData?.user?.id) {
    redirect("/login");
  }
  return authData.user.id;
}

// ---------------------------------------------------------------------------
// ACTION: createCheckoutSession
// ---------------------------------------------------------------------------
/**
 * Initiates a Stripe Checkout Session for subscription signup.
 *
 * IMPORTANT: This action requires Stripe to be fully configured via:
 *   STRIPE_SECRET_KEY, STRIPE_MONTHLY_PRICE_ID / STRIPE_YEARLY_PRICE_ID
 *
 * If not configured, returns an error result WITHOUT simulating payment.
 * The caller (UI) is responsible for displaying the configuration notice.
 *
 * PRD § 04: Account creation ≠ active subscription.
 * Checkout completion → webhook → subscriptions table update.
 */
export async function createCheckoutSession(
  plan: "monthly" | "yearly"
): Promise<SubscriptionActionResult> {
  // 1. Require authenticated session
  let userId: string;
  try {
    userId = await requireAuthenticatedUser();
  } catch {
    return { success: false, error: "You must be signed in to start a subscription." };
  }

  // 2. Check pricing configuration
  const pricingConfig = getPricingConfig();

  if (!pricingConfig.stripeConfigured) {
    return {
      success: false,
      error:
        "Payment gateway is not configured. " +
        "Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable subscriptions.",
    };
  }

  const priceId =
    plan === "yearly"
      ? pricingConfig.yearly.priceId
      : pricingConfig.monthly.priceId;

  if (!priceId) {
    return {
      success: false,
      error: `Pricing for the ${plan} plan is not yet configured. Set STRIPE_${plan.toUpperCase()}_PRICE_ID.`,
    };
  }

  // 3. Check if user already has an active subscription
  const accessState = await resolveSubscriptionAccess(userId);
  if (accessState.hasAccess) {
    return {
      success: false,
      error: "You already have an active subscription. Manage it from your account settings.",
    };
  }

  // 4. Create Stripe Checkout Session
  try {
    const stripe = getStripeClient();
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Pass user_id in metadata so webhook can correlate the subscription
      metadata: {
        user_id: userId,
        plan,
      },
      // Stripe uses this to pre-fill the email field
      client_reference_id: userId,
      success_url: `${baseUrl}/dashboard?subscription=success`,
      cancel_url: `${baseUrl}/pricing?subscription=canceled`,
      // Allow billing address collection (required for some payment methods)
      billing_address_collection: "auto",
      // Allow promotion codes (useful for future discount campaigns)
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return {
        success: false,
        error: "Failed to create checkout session. Please try again.",
      };
    }

    return { success: true, url: session.url };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    console.error("[createCheckoutSession] Stripe error:", message);
    return {
      success: false,
      error: "Payment gateway error. Please try again or contact support.",
    };
  }
}

// ---------------------------------------------------------------------------
// ACTION: createPortalSession
// ---------------------------------------------------------------------------
/**
 * Creates a Stripe Customer Portal session for subscription management.
 *
 * Allows the subscriber to:
 *   - Cancel their subscription (cancel_at_period_end: true per PRD § 04)
 *   - Update payment method
 *   - Download invoices
 *
 * Requires: STRIPE_SECRET_KEY + an existing Stripe customer ID.
 */
export async function createPortalSession(): Promise<SubscriptionActionResult> {
  // 1. Require authenticated session
  let userId: string;
  try {
    userId = await requireAuthenticatedUser();
  } catch {
    return { success: false, error: "You must be signed in to manage your subscription." };
  }

  // 2. Check Stripe configuration
  if (!getPricingConfig().stripeConfigured) {
    return {
      success: false,
      error: "Subscription management is not configured. Please contact support.",
    };
  }

  // 3. Fetch current subscription to get the Stripe customer ID
  const accessState = await resolveSubscriptionAccess(userId);
  const customerId = accessState.subscription?.provider_customer_id;

  if (!customerId) {
    return {
      success: false,
      error: "No active subscription found. Subscribe first to manage billing.",
    };
  }

  // 4. Create Customer Portal Session
  try {
    const stripe = getStripeClient();
    const baseUrl = getBaseUrl();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/account`,
    });

    return { success: true, portalUrl: portalSession.url };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    console.error("[createPortalSession] Stripe error:", message);
    return {
      success: false,
      error: "Failed to open subscription portal. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// ACTION: cancelSubscription
// ---------------------------------------------------------------------------
/**
 * Requests cancellation of the user's Stripe subscription at period end.
 *
 * PRD § 04: cancel_at_period_end = true.
 * Access is RETAINED until current_period_end.
 * The webhook (customer.subscription.updated) will update the DB record.
 */
export async function cancelSubscription(): Promise<SubscriptionActionResult> {
  // 1. Require authenticated session
  let userId: string;
  try {
    userId = await requireAuthenticatedUser();
  } catch {
    return { success: false, error: "You must be signed in to cancel your subscription." };
  }

  // 2. Check Stripe configuration
  if (!getPricingConfig().stripeConfigured) {
    return {
      success: false,
      error: "Subscription management is not configured. Please contact support.",
    };
  }

  // 3. Fetch current subscription
  const accessState = await resolveSubscriptionAccess(userId);
  const stripeSubscriptionId = accessState.subscription?.provider_subscription_id;

  if (!stripeSubscriptionId) {
    return {
      success: false,
      error: "No active subscription found to cancel.",
    };
  }

  if (accessState.subscription?.cancel_at_period_end) {
    return {
      success: false,
      error: "Your subscription is already scheduled for cancellation at period end.",
    };
  }

  // 4. Set cancel_at_period_end = true via Stripe API
  try {
    const stripe = getStripeClient();

    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // DB update will happen via webhook (customer.subscription.updated)
    return {
      success: true,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    console.error("[cancelSubscription] Stripe error:", message);
    return {
      success: false,
      error: "Failed to cancel subscription. Please try again or use the billing portal.",
    };
  }
}
