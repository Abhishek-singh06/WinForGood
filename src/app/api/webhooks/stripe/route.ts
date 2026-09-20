import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * =========================================================================
 * STRIPE WEBHOOK HANDLER
 * Route: POST /api/webhooks/stripe
 * PRD Reference: § 04 (Subscription & Billing)
 * Business Rules: BR-013 (lifecycle), BR-014 (real-time status)
 * Stripe API Version: 2026-08-26.dahlia
 * =========================================================================
 *
 * SECURITY:
 *   - Every request is verified against STRIPE_WEBHOOK_SECRET.
 *   - Raw body is read BEFORE any other processing (required by Stripe SDK).
 *   - Unverified requests are rejected with 400.
 *   - STRIPE_WEBHOOK_SECRET must NEVER appear in client-accessible code.
 *
 * IDEMPOTENCY:
 *   - Each event is identified by event.id.
 *   - Before processing, we check last_stripe_event_id on the subscription row.
 *   - Duplicate events (replays) are silently acknowledged (200) without
 *     re-applying state changes.
 *
 * DB WRITES:
 *   - All subscription table mutations use the Supabase service role client.
 *   - This bypasses RLS (intentional — webhook is server-to-server trusted).
 *   - Regular authenticated clients cannot write to the subscriptions table.
 *
 * HANDLED EVENTS:
 *   - checkout.session.completed → create subscription record
 *   - customer.subscription.created → upsert subscription record
 *   - customer.subscription.updated → update subscription record
 *   - customer.subscription.deleted → mark as canceled/lapsed
 *   - invoice.payment_succeeded → confirm active status
 *   - invoice.payment_failed → mark as past_due
 *
 * NOTE on Stripe API 2026-08-26.dahlia field changes:
 *   - Subscription.current_period_start/end are removed.
 *     Period end is available via billing_schedules[0].bill_until.computed_timestamp
 *   - Invoice.subscription is removed.
 *     Use invoice.parent.subscription_details.subscription instead.
 */

// ---------------------------------------------------------------------------
// Disable body parsing — Stripe SDK requires raw bytes for signature verification
// ---------------------------------------------------------------------------
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Helper: Map Stripe subscription status to our DB enum
// ---------------------------------------------------------------------------
type OurStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid"
  | "lapsed";

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): OurStatus {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    case "unpaid":
      return "unpaid";
    case "paused":
      return "lapsed";
    default:
      return "lapsed";
  }
}

// ---------------------------------------------------------------------------
// Helper: Determine plan from price ID
// ---------------------------------------------------------------------------
function determinePlan(priceId: string | null): "monthly" | "yearly" {
  const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID;
  if (yearlyPriceId && priceId === yearlyPriceId) {
    return "yearly";
  }
  return "monthly";
}

// ---------------------------------------------------------------------------
// Helper: Extract period end from Stripe Subscription (dahlia API)
// In the 2026-08-26.dahlia API, current_period_end is no longer a top-level
// field. We derive it from billing_schedules[0].bill_until.computed_timestamp.
// ---------------------------------------------------------------------------
function extractPeriodEnd(stripeSub: Stripe.Subscription): string | null {
  const schedule = stripeSub.billing_schedules?.[0];
  if (schedule?.bill_until?.computed_timestamp) {
    return new Date(schedule.bill_until.computed_timestamp * 1000).toISOString();
  }
  // Fallback: use trial_end if in trial
  if (stripeSub.trial_end) {
    return new Date(stripeSub.trial_end * 1000).toISOString();
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helper: Extract period start from Stripe Subscription (dahlia API)
// ---------------------------------------------------------------------------
function extractPeriodStart(stripeSub: Stripe.Subscription): string | null {
  if (stripeSub.start_date) {
    return new Date(stripeSub.start_date * 1000).toISOString();
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helper: Extract subscription ID from Stripe Invoice (dahlia API)
// In 2026-08-26.dahlia, invoice.subscription was removed.
// Use invoice.parent.subscription_details.subscription instead.
// ---------------------------------------------------------------------------
function extractInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  // New API: parent.subscription_details.subscription
  const parent = invoice.parent;
  if (parent && parent.type === "subscription_details") {
    const sub = parent.subscription_details?.subscription;
    if (typeof sub === "string") return sub;
    if (sub && typeof sub === "object" && "id" in sub) return (sub as Stripe.Subscription).id;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helper: Check idempotency — has this event already been processed?
// ---------------------------------------------------------------------------
async function isEventAlreadyProcessed(
  supabase: ReturnType<typeof createAdminClient>,
  subscriptionId: string,
  eventId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("last_stripe_event_id")
    .eq("provider_subscription_id", subscriptionId)
    .single();

  return data?.last_stripe_event_id === eventId;
}

// ---------------------------------------------------------------------------
// Handler: checkout.session.completed
// ---------------------------------------------------------------------------
async function handleCheckoutSessionCompleted(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
  eventId: string
): Promise<void> {
  const userId = session.metadata?.user_id || session.client_reference_id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer as Stripe.Customer | null)?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : (session.subscription as Stripe.Subscription | null)?.id;

  if (!userId || !subscriptionId) {
    console.error("[webhook] checkout.session.completed: missing user_id or subscription_id", {
      userId,
      subscriptionId,
    });
    return;
  }

  // Fetch the full subscription object from Stripe to get period dates
  const stripe = getStripeClient();
  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

  const plan = determinePlan(
    stripeSub.items.data[0]?.price?.id || null
  );

  const upsertData = {
    user_id: userId,
    provider: "stripe",
    provider_customer_id: customerId || null,
    provider_subscription_id: subscriptionId,
    plan,
    status: mapStripeStatus(stripeSub.status),
    current_period_start: extractPeriodStart(stripeSub),
    current_period_end: extractPeriodEnd(stripeSub),
    cancel_at_period_end: stripeSub.cancel_at_period_end,
    canceled_at: stripeSub.canceled_at
      ? new Date(stripeSub.canceled_at * 1000).toISOString()
      : null,
    last_stripe_event_id: eventId,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(upsertData, { onConflict: "user_id" });

  if (error) {
    console.error("[webhook] checkout.session.completed: DB upsert failed", error);
    throw new Error(`DB upsert failed: ${error.message}`);
  }

  console.log("[webhook] checkout.session.completed: subscription created for user", userId);
}

// ---------------------------------------------------------------------------
// Handler: customer.subscription.created / customer.subscription.updated
// ---------------------------------------------------------------------------
async function handleSubscriptionUpsert(
  supabase: ReturnType<typeof createAdminClient>,
  stripeSub: Stripe.Subscription,
  eventId: string
): Promise<void> {
  // Idempotency check
  if (await isEventAlreadyProcessed(supabase, stripeSub.id, eventId)) {
    console.log("[webhook] Event already processed, skipping:", eventId);
    return;
  }

  // Locate user_id from the subscription metadata
  const userId = stripeSub.metadata?.user_id;

  // If no metadata, look up from existing DB row via subscription ID
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const { data: existingRow } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("provider_subscription_id", stripeSub.id)
      .single();
    resolvedUserId = existingRow?.user_id;
  }

  if (!resolvedUserId) {
    console.error(
      "[webhook] subscription upsert: cannot resolve user_id for subscription",
      stripeSub.id
    );
    return;
  }

  const plan = determinePlan(stripeSub.items.data[0]?.price?.id || null);
  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : (stripeSub.customer as Stripe.Customer | null)?.id;

  const upsertData = {
    user_id: resolvedUserId,
    provider: "stripe",
    provider_customer_id: customerId || null,
    provider_subscription_id: stripeSub.id,
    plan,
    status: mapStripeStatus(stripeSub.status),
    current_period_start: extractPeriodStart(stripeSub),
    current_period_end: extractPeriodEnd(stripeSub),
    cancel_at_period_end: stripeSub.cancel_at_period_end,
    canceled_at: stripeSub.canceled_at
      ? new Date(stripeSub.canceled_at * 1000).toISOString()
      : null,
    last_stripe_event_id: eventId,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(upsertData, { onConflict: "user_id" });

  if (error) {
    console.error("[webhook] subscription upsert: DB error", error);
    throw new Error(`DB upsert failed: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Handler: customer.subscription.deleted
// ---------------------------------------------------------------------------
async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createAdminClient>,
  stripeSub: Stripe.Subscription,
  eventId: string
): Promise<void> {
  // Idempotency check
  if (await isEventAlreadyProcessed(supabase, stripeSub.id, eventId)) {
    console.log("[webhook] Event already processed, skipping:", eventId);
    return;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "lapsed",
      cancel_at_period_end: false,
      canceled_at: new Date().toISOString(),
      last_stripe_event_id: eventId,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_subscription_id", stripeSub.id);

  if (error) {
    console.error("[webhook] subscription.deleted: DB update failed", error);
    throw new Error(`DB update failed: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Handler: invoice.payment_succeeded
// ---------------------------------------------------------------------------
async function handleInvoicePaymentSucceeded(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice,
  eventId: string
): Promise<void> {
  const subscriptionId = extractInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  // Idempotency check
  if (await isEventAlreadyProcessed(supabase, subscriptionId, eventId)) {
    console.log("[webhook] Event already processed, skipping:", eventId);
    return;
  }

  // Fetch the updated subscription from Stripe to get fresh period dates
  const stripe = getStripeClient();
  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      current_period_start: extractPeriodStart(stripeSub),
      current_period_end: extractPeriodEnd(stripeSub),
      cancel_at_period_end: stripeSub.cancel_at_period_end,
      last_stripe_event_id: eventId,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_subscription_id", subscriptionId);

  if (error) {
    console.error("[webhook] invoice.payment_succeeded: DB update failed", error);
    throw new Error(`DB update failed: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Handler: invoice.payment_failed
// ---------------------------------------------------------------------------
async function handleInvoicePaymentFailed(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice,
  eventId: string
): Promise<void> {
  const subscriptionId = extractInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  // Idempotency check
  if (await isEventAlreadyProcessed(supabase, subscriptionId, eventId)) {
    console.log("[webhook] Event already processed, skipping:", eventId);
    return;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      last_stripe_event_id: eventId,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_subscription_id", subscriptionId);

  if (error) {
    console.error("[webhook] invoice.payment_failed: DB update failed", error);
    throw new Error(`DB update failed: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// MAIN WEBHOOK ROUTE HANDLER
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Read raw body (required for Stripe signature verification)
  let rawBody: Buffer;
  try {
    const arrayBuffer = await req.arrayBuffer();
    rawBody = Buffer.from(arrayBuffer);
  } catch {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  // 2. Verify webhook secret is configured
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // 3. Verify Stripe signature
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // 4. Initialize Supabase admin client (service role — bypasses RLS)
  const supabase = createAdminClient();

  // 5. Route to appropriate handler
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          supabase,
          event.data.object as Stripe.Checkout.Session,
          event.id
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(
          supabase,
          event.data.object as Stripe.Subscription,
          event.id
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          supabase,
          event.data.object as Stripe.Subscription,
          event.id
        );
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          supabase,
          event.data.object as Stripe.Invoice,
          event.id
        );
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(
          supabase,
          event.data.object as Stripe.Invoice,
          event.id
        );
        break;

      default:
        // Unknown events are safely ignored — Stripe may send many event types
        console.log("[webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Handler error";
    console.error("[webhook] Handler error:", message);
    // Return 500 to signal Stripe to retry the event
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
