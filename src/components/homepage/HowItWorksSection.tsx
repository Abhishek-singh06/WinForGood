import React from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ListOrdered, HeartHandshake, Sparkles, CheckCircle2 } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: ListOrdered,
      title: "Subscribe & Log 5 Stableford Scores",
      badge: "Performance Tracking",
      description:
        "Join on a monthly or discounted yearly plan. Enter your latest five golf rounds in Stableford format (points range 1–45) with authentic dates. The platform holds your rolling latest 5 rounds — each new score automatically replaces the oldest stored round.",
      details: [
        "Stableford points strictly validated (1–45)",
        "Strictly one score entry permitted per date",
        "Automatic rolling FIFO score retention",
      ],
    },
    {
      number: "02",
      icon: HeartHandshake,
      title: "Direct At Least 10% to Your Cause",
      badge: "Charitable Impact",
      description:
        "Select your preferred charity at signup. A minimum of 10% of your subscription fee is routed directly to their initiatives. You can voluntarily increase your contribution percentage at any time or make direct one-off donations outside of gameplay.",
      details: [
        "10% minimum contribution platform floor",
        "Voluntary increase up to 100% of fee",
        "Direct support for youth, veterans & water security",
      ],
    },
    {
      number: "03",
      icon: Sparkles,
      title: "Participate in Monthly Prize Draws",
      badge: "Anticipation & Rewards",
      description:
        "Every month, the platform executes a prize draw. Match 3, 4, or 5 numbers with your entered score set to win from the prize pool. The 5-number match captures a 40% pool share and rolls forward as a growing jackpot if unclaimed.",
      details: [
        "Tier shares: 5-match (40%), 4-match (35%), 3-match (25%)",
        "5-match jackpot carries forward if unclaimed",
        "Winners submit scorecard proof before payouts",
      ],
    },
  ];

  return (
    <section className="py-24 border-b border-border-subtle bg-bg-near">
      <Container size="wide">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16">
          <Badge variant="blue">The Mechanics</Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white tracking-tight">
            Built on Rigorous Performance,{" "}
            <span className="italic text-text-silver">Transparent Giving.</span>
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Three simple phases govern how Digital Heroes turns regular golf rounds into verified
            support for causes and rewarding monthly community draws.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.number}
                variant="gradient"
                className="flex flex-col justify-between space-y-6 hover:border-border-silver transition-colors"
              >
                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-mono font-bold text-white/20">
                      {step.number}
                    </span>
                    <Badge variant="charcoal">{step.badge}</Badge>
                  </div>

                  <div className="w-10 h-10 rounded bg-surface-graphite border border-border-silver/40 flex items-center justify-center text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-xl font-serif font-medium text-white">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bullets */}
                <div className="pt-4 border-t border-border-subtle space-y-2">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
