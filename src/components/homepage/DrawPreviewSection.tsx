import React from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, ArrowRight, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function DrawPreviewSection() {
  const tiers = [
    {
      match: "5-Number Match",
      share: "40%",
      rollover: true,
      tagline: "The Grand Jackpot",
      description:
        "Match all five of your retained Stableford scores with the five drawn numbers. Captures 40% of the active monthly prize pool.",
      rolloverBadge: "Rollover: YES (Jackpot Carries Forward)",
    },
    {
      match: "4-Number Match",
      share: "35%",
      rollover: false,
      tagline: "Tier 2 Excellence",
      description:
        "Match four of your five retained Stableford scores with the monthly draw numbers. Shared equally among all qualifying 4-match subscribers.",
      rolloverBadge: "Rollover: NO",
    },
    {
      match: "3-Number Match",
      share: "25%",
      rollover: false,
      tagline: "Tier 3 Performance",
      description:
        "Match three of your five retained Stableford scores. Accessible threshold celebrating consistent play across all handicap ranges.",
      rolloverBadge: "Rollover: NO",
    },
  ];

  return (
    <section className="py-24 border-b border-border-subtle bg-bg-near">
      <Container size="wide">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16">
          <Badge variant="red" className="flex items-center gap-1.5 w-fit">
            <Trophy className="w-3 h-3 text-red-500" /> The Draw Engine
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white tracking-tight">
            Transparent Reward Tiers,{" "}
            <span className="italic text-text-silver">Automatic Enforcement.</span>
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            The PRD defines three pre-determined match tiers (§ 06 & § 07). Monthly distributions
            are calculated automatically from active subscribers, with equal splits among winners in
            the same tier.
          </p>
        </div>

        {/* 3 Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier) => (
            <Card
              key={tier.match}
              variant="gradient"
              className="flex flex-col justify-between space-y-6 hover:border-border-silver transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
                    {tier.tagline}
                  </span>
                  <Badge variant={tier.rollover ? "red" : "charcoal"}>
                    {tier.share} Pool Share
                  </Badge>
                </div>

                <h3 className="text-2xl font-serif font-medium text-white">
                  {tier.match}
                </h3>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {tier.description}
                </p>
              </div>

              {/* Rollover Status & Policy */}
              <div className="pt-4 border-t border-border-subtle space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      tier.rollover ? "bg-red-500 animate-pulse" : "bg-slate-500"
                    }`}
                  />
                  <span className="text-xs font-mono font-medium text-text-silver">
                    {tier.rolloverBadge}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-text-muted">
                  PRD § 07: Prizes split equally among multiple winners in the same tier.
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Compliance & Transparency Box */}
        <div className="bg-surface-charcoal/80 border border-border-subtle rounded-md p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-9 h-9 rounded bg-surface-graphite border border-border-silver/40 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-white font-bold block">
                Verification & Audit Standard (PRD § 09)
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">
                Verification applies strictly to winners. Winning subscribers submit an official
                scorecard screenshot before payouts transition from Pending to Paid.
              </p>
            </div>
          </div>
          <Link href="/how-it-works">
            <Button variant="silver" size="sm" className="font-mono text-xs uppercase shrink-0">
              Read Draw Rules <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
