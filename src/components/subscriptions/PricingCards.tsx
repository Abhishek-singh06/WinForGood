"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Check,
  ShieldCheck,
  Heart,
  Sparkles,
  AlertCircle,
  CreditCard,
  Loader2,
} from "lucide-react";
import type { PricingConfig } from "@/lib/subscriptions/types";
import { createCheckoutSession } from "@/lib/subscriptions/actions";

/**
 * PricingCards — client component for the pricing page.
 * Handles the billing interval toggle and Stripe checkout redirect.
 *
 * OPEN DECISION: Actual prices and currency are NOT shown here.
 * If Stripe is not configured, the CTA shows a "Configuration Required" notice.
 */

interface PricingCardsProps {
  pricingConfig: PricingConfig;
}

export function PricingCards({ pricingConfig }: PricingCardsProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [isPending, startTransition] = useTransition();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const monthlyConfigured = pricingConfig.monthly.configured;
  const yearlyConfigured = pricingConfig.yearly.configured;
  const currentPlanConfigured =
    billingInterval === "monthly" ? monthlyConfigured : yearlyConfigured;

  function handleCheckout(plan: "monthly" | "yearly") {
    setCheckoutError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(plan);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setCheckoutError(result.error || "Failed to start checkout.");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Billing Switcher */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="inline-flex items-center p-1 rounded-full bg-surface-charcoal border border-border-subtle">
          <button
            onClick={() => setBillingInterval("monthly")}
            className={`px-5 py-2 rounded-full text-xs font-mono transition-colors ${
              billingInterval === "monthly"
                ? "bg-accent-blue-subtle text-blue-400 border border-blue-500 font-bold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Monthly Plan
          </button>
          <button
            onClick={() => setBillingInterval("yearly")}
            className={`px-5 py-2 rounded-full text-xs font-mono transition-colors flex items-center gap-1.5 ${
              billingInterval === "yearly"
                ? "bg-accent-blue-subtle text-blue-400 border border-blue-500 font-bold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Yearly Plan{" "}
            <span className="text-[10px] text-red-400 font-bold">(Discounted)</span>
          </button>
        </div>

        {checkoutError && (
          <div className="max-w-md mx-auto p-3 rounded bg-accent-red-subtle border border-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-300">{checkoutError}</p>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Monthly Card */}
        <Card
          variant={billingInterval === "monthly" ? "gradient" : "default"}
          className={`flex flex-col justify-between space-y-6 ${
            billingInterval === "monthly" ? "border-border-silver" : ""
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
                Standard Flexible
              </span>
              <Badge variant="charcoal">PRD § 04</Badge>
            </div>

            <h3 className="text-2xl font-serif font-medium text-white">Monthly Membership</h3>

            <div className="flex items-baseline gap-2">
              {monthlyConfigured ? (
                <span className="text-sm font-mono text-text-secondary">
                  Pricing via Stripe catalogue
                </span>
              ) : (
                <>
                  <span className="text-4xl font-mono font-bold text-white">[TBD] /mo</span>
                  <span className="text-xs font-mono text-text-muted">
                    open decision
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Full access to golf performance score logging, monthly draw participation, and charity allocation.
            </p>

            <ul className="space-y-2.5 text-xs text-text-secondary pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>5-score rolling performance tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Guaranteed minimum 10% charity contribution</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Entry into 3-, 4-, and 5-number monthly draws</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Cancel anytime in self-service portal</span>
              </li>
            </ul>
          </div>

          {pricingConfig.stripeConfigured && monthlyConfigured ? (
            <Button
              variant={billingInterval === "monthly" ? "primary" : "silver"}
              size="md"
              className="w-full font-mono text-xs uppercase"
              onClick={() => handleCheckout("monthly")}
              disabled={isPending}
            >
              {isPending && billingInterval === "monthly" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Redirecting…
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  Subscribe Monthly
                </>
              )}
            </Button>
          ) : (
            <Link href="/signup?plan=monthly" className="w-full">
              <Button
                variant={billingInterval === "monthly" ? "primary" : "silver"}
                size="md"
                className="w-full font-mono text-xs uppercase"
              >
                {pricingConfig.stripeConfigured ? "Configuration Required" : "Create Account"}
              </Button>
            </Link>
          )}
        </Card>

        {/* Yearly Card */}
        <Card
          variant={billingInterval === "yearly" ? "gradient" : "default"}
          className={`flex flex-col justify-between space-y-6 relative ${
            billingInterval === "yearly" ? "border-border-silver" : ""
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
                Annual Commitment
              </span>
              <Badge variant="red">Discounted Rate (§ 04)</Badge>
            </div>

            <h3 className="text-2xl font-serif font-medium text-white">Yearly Membership</h3>

            <div className="flex items-baseline gap-2">
              {yearlyConfigured ? (
                <span className="text-sm font-mono text-text-secondary">
                  Pricing via Stripe catalogue
                </span>
              ) : (
                <>
                  <span className="text-4xl font-mono font-bold text-white">[TBD] /yr</span>
                  <span className="text-xs font-mono text-text-muted">
                    open decision
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Enjoy full platform features across 12 monthly draws at an exclusive discounted annual rate.
            </p>

            <ul className="space-y-2.5 text-xs text-text-secondary pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>All Monthly Plan features included</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Discounted annual rate (PRD § 04)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>12 consecutive monthly draw entries</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Sustained annual charity impact</span>
              </li>
            </ul>
          </div>

          {pricingConfig.stripeConfigured && yearlyConfigured ? (
            <Button
              variant={billingInterval === "yearly" ? "primary" : "silver"}
              size="md"
              className="w-full font-mono text-xs uppercase"
              onClick={() => handleCheckout("yearly")}
              disabled={isPending}
            >
              {isPending && billingInterval === "yearly" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Redirecting…
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  Subscribe Yearly
                </>
              )}
            </Button>
          ) : (
            <Link href="/signup?plan=yearly" className="w-full">
              <Button
                variant={billingInterval === "yearly" ? "primary" : "silver"}
                size="md"
                className="w-full font-mono text-xs uppercase"
              >
                {pricingConfig.stripeConfigured ? "Configuration Required" : "Create Account"}
              </Button>
            </Link>
          )}
        </Card>
      </div>

      {/* Pricing Configuration Notice (when Stripe not configured) */}
      {!pricingConfig.stripeConfigured && (
        <div className="max-w-2xl mx-auto p-4 rounded bg-surface-charcoal border border-border-subtle space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-text-muted" />
            <span className="text-xs font-mono uppercase text-text-muted font-bold">
              Pricing Configuration Required
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            To enable subscription checkout, configure the following server environment variables:
          </p>
          <ul className="space-y-1.5 text-xs font-mono text-text-muted">
            <li>
              <code className="text-blue-400">STRIPE_SECRET_KEY</code> — Stripe secret key
              (server-only, never expose publicly)
            </li>
            <li>
              <code className="text-blue-400">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> — Stripe
              publishable key (safe for client)
            </li>
            <li>
              <code className="text-blue-400">STRIPE_MONTHLY_PRICE_ID</code> — Monthly plan Stripe
              Price ID
            </li>
            <li>
              <code className="text-blue-400">STRIPE_YEARLY_PRICE_ID</code> — Yearly plan Stripe
              Price ID
            </li>
            <li>
              <code className="text-blue-400">STRIPE_WEBHOOK_SECRET</code> — Webhook signing secret
              (server-only)
            </li>
          </ul>
        </div>
      )}

      {/* Trust indicators */}
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: ShieldCheck, label: "PCI-Compliant", desc: "Stripe handles all card data securely" },
          { icon: Heart, label: "Min 10% to Charity", desc: "Guaranteed by platform rules (PRD § 07)" },
          { icon: Sparkles, label: "Monthly Prize Draws", desc: "All members qualify for 3, 4, and 5-match draws" },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex flex-col items-center text-center gap-2 p-4 rounded bg-surface-charcoal border border-border-subtle"
          >
            <Icon className="w-5 h-5 text-text-silver" />
            <span className="text-xs font-mono font-bold text-white uppercase">{label}</span>
            <span className="text-[11px] text-text-muted leading-relaxed">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
