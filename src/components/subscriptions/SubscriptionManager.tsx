"use client";

import React, { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
} from "@/lib/subscriptions/actions";
import type { SubscriptionAccessState } from "@/lib/subscriptions/types";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  CreditCard,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";

/**
 * =========================================================================
 * SubscriptionManager — Client Component
 * =========================================================================
 * Renders real-time subscription status and management actions for the
 * subscriber dashboard account page.
 *
 * OPEN DECISIONS:
 *   - Pricing, currency, and amounts are NOT displayed when unconfigured.
 *   - The component shows "Pricing Configuration Required" when Stripe env
 *     vars are not set, per Phase 4 specification.
 */

interface SubscriptionManagerProps {
  accessState: SubscriptionAccessState;
  stripeConfigured: boolean;
}

export function SubscriptionManager({
  accessState,
  stripeConfigured,
}: SubscriptionManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  const { hasAccess, subscription, statusLabel, inGracePeriod } = accessState;

  // Status badge variant
  const statusVariant = hasAccess
    ? inGracePeriod
      ? "red"
      : "blue"
    : subscription
    ? "red"
    : "charcoal";

  // Status icon
  const StatusIcon = hasAccess
    ? inGracePeriod
      ? Clock
      : CheckCircle2
    : subscription
    ? XCircle
    : AlertTriangle;

  const statusIconClass = hasAccess
    ? inGracePeriod
      ? "text-red-400"
      : "text-blue-400"
    : "text-red-400";

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------
  function handleCheckout() {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const result = await createCheckoutSession(selectedPlan);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setActionError(result.error || "Failed to start checkout.");
      }
    });
  }

  function handlePortal() {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const result = await createPortalSession();
      if (result.success && result.portalUrl) {
        window.location.href = result.portalUrl;
      } else {
        setActionError(result.error || "Failed to open billing portal.");
      }
    });
  }

  function handleCancel() {
    if (
      !confirm(
        "Cancel your subscription? You will retain access until the end of your current billing period."
      )
    ) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const result = await cancelSubscription();
      if (result.success) {
        setActionSuccess(
          "Cancellation scheduled. Your access continues until the end of the current billing period."
        );
      } else {
        setActionError(result.error || "Failed to cancel subscription.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      <Card variant="gradient" className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-serif font-medium text-white">
            Subscription Status
          </h2>
          <Badge variant={statusVariant}>
            <StatusIcon className={`w-3 h-3 mr-1.5 ${statusIconClass}`} />
            {statusLabel}
          </Badge>
        </div>

        {/* Subscription details */}
        {subscription ? (
          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="space-y-0.5">
                <span className="text-text-muted block">Plan</span>
                <span className="text-white capitalize font-medium">
                  {subscription.plan} membership
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-text-muted block">Status</span>
                <span className="text-white capitalize font-medium">
                  {subscription.status.replace(/_/g, " ")}
                </span>
              </div>

              {subscription.current_period_end && (
                <div className="space-y-0.5 col-span-2">
                  <span className="text-text-muted block">
                    {subscription.cancel_at_period_end
                      ? "Access Until"
                      : "Next Renewal"}
                  </span>
                  <span className="text-white font-medium">
                    {new Date(subscription.current_period_end).toLocaleDateString(
                      "en-GB",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              )}
            </div>

            {inGracePeriod && (
              <div className="p-3 rounded bg-accent-red-subtle border border-red-800 flex items-start gap-2">
                <Clock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-300 leading-relaxed">
                  Your subscription is scheduled to cancel at the end of the
                  current billing period. You retain full access until then.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary leading-relaxed">
              No active subscription found. Subscribe to unlock golf score
              tracking, monthly draws, and charity allocations.
            </p>
          </div>
        )}

        {/* Action Feedback */}
        {actionError && (
          <div className="p-3 rounded bg-accent-red-subtle border border-red-800 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-300">{actionError}</p>
          </div>
        )}
        {actionSuccess && (
          <div className="p-3 rounded bg-accent-blue-subtle border border-blue-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-300">{actionSuccess}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 space-y-3">
          {!hasAccess && !subscription && (
            <>
              {/* Plan selector for new subscriptions */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                  Select Plan
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPlan("monthly")}
                    className={`flex-1 px-4 py-2.5 rounded text-xs font-mono border transition-colors ${
                      selectedPlan === "monthly"
                        ? "bg-accent-blue-subtle text-blue-400 border-blue-700 font-bold"
                        : "bg-transparent text-text-secondary border-border-subtle hover:text-white"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setSelectedPlan("yearly")}
                    className={`flex-1 px-4 py-2.5 rounded text-xs font-mono border transition-colors ${
                      selectedPlan === "yearly"
                        ? "bg-accent-blue-subtle text-blue-400 border-blue-700 font-bold"
                        : "bg-transparent text-text-secondary border-border-subtle hover:text-white"
                    }`}
                  >
                    Yearly <span className="text-red-400">(Discounted)</span>
                  </button>
                </div>
              </div>

              {stripeConfigured ? (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full font-mono text-xs"
                  onClick={handleCheckout}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Redirecting to Checkout…
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                      Subscribe — {selectedPlan === "yearly" ? "Yearly" : "Monthly"} Plan
                    </>
                  )}
                </Button>
              ) : (
                <div className="p-3.5 rounded bg-surface-charcoal border border-border-subtle text-center space-y-1.5">
                  <ShieldCheck className="w-5 h-5 text-text-muted mx-auto" />
                  <p className="text-[11px] font-mono text-text-muted">
                    Pricing Configuration Required
                  </p>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Set STRIPE_SECRET_KEY, STRIPE_MONTHLY_PRICE_ID, and
                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable subscriptions.
                  </p>
                </div>
              )}
            </>
          )}

          {hasAccess && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="font-mono text-xs gap-1.5"
                onClick={handlePortal}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                Manage Billing
              </Button>

              {!subscription?.cancel_at_period_end && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="font-mono text-xs gap-1.5"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          )}

          {!hasAccess && subscription && (
            /* Past due / lapsed — offer resubscribe */
            stripeConfigured ? (
              <Button
                variant="primary"
                size="md"
                className="w-full font-mono text-xs"
                onClick={handleCheckout}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                )}
                Resubscribe
              </Button>
            ) : (
              <p className="text-[11px] font-mono text-text-muted text-center">
                Payment gateway configuration required to resubscribe.
              </p>
            )
          )}
        </div>
      </Card>

      {/* Security note */}
      <Card variant="default" className="space-y-2">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
          Billing Security
        </h3>
        <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
          <li>• All payment processing is handled by Stripe. We never store card details.</li>
          <li>• Cancellations take effect at the end of your current billing period.</li>
          <li>• Your access remains active until the billing period ends.</li>
          <li>• Receipts and invoices are available in the Stripe billing portal.</li>
        </ul>
      </Card>
    </div>
  );
}
