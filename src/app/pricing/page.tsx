import React from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle } from "lucide-react";
import { getPricingConfig } from "@/lib/subscriptions/resolver";
import { PricingCards } from "@/components/subscriptions/PricingCards";

/**
 * Pricing page — server component.
 *
 * OPEN DECISION: Exact pricing, currency, and discount percentage remain
 * STATUS: OPEN DECISION (decision 5). This page does NOT invent prices.
 * If Stripe is not configured, a configuration-required notice is shown
 * instead of fake pricing.
 *
 * Config-driven approach:
 * - STRIPE_MONTHLY_PRICE_ID → enables monthly plan checkout
 * - STRIPE_YEARLY_PRICE_ID → enables yearly plan checkout
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → enables client Stripe.js
 * - STRIPE_SECRET_KEY → required for server-side Stripe operations
 *
 * If price IDs are not set, a "Pricing Configuration Required" notice is shown.
 */
export default async function PricingPage() {
  const pricingConfig = getPricingConfig();

  return (
    <div className="py-16 sm:py-24 bg-bg-deep space-y-16">
      <Container size="wide">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Badge variant="blue">Membership Plans</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-medium text-white tracking-tight">
            Transparent Pricing. Direct Impact.
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
            Choose between a monthly plan or a discounted yearly membership. Every plan qualifies
            for monthly prize pools and guarantees at least 10% to your selected charity.
          </p>

          {/* Open Decision Notice */}
          <div className="max-w-xl mx-auto p-4 rounded bg-surface-charcoal border border-border-silver flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-white font-bold block">
                Configuration Notice (Open Decision 5)
              </span>
              <p className="text-xs text-text-muted leading-relaxed">
                Exact currency and subscription rates remain{" "}
                <code>STATUS: OPEN DECISION</code> awaiting stakeholder determination.
                {pricingConfig.stripeConfigured
                  ? " Stripe is configured — pricing is sourced from your Stripe product catalogue."
                  : " Configure Stripe environment variables to enable subscription checkout."}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards — client component for billing interval toggle */}
        <PricingCards pricingConfig={pricingConfig} />
      </Container>
    </div>
  );
}
