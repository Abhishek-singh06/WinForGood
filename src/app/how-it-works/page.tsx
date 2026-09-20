import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ListOrdered,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "How It Works — Digital Heroes",
  description:
    "Learn how Stableford scoring, charity allocations, and monthly prize draws operate on Digital Heroes.",
};

export default function HowItWorksPage() {
  return (
    <div className="py-16 sm:py-24 bg-bg-deep space-y-20">
      {/* Page Header */}
      <Container size="wide">
        <div className="max-w-3xl space-y-4">
          <Badge variant="blue">Platform Mechanics</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-medium text-white tracking-tight">
            How Digital Heroes Works.
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            A comprehensive overview of our three foundational systems: rolling score retention,
            guaranteed charity contributions, and audited monthly prize draws.
          </p>
        </div>
      </Container>

      {/* Pillar 1: Stableford Score Management */}
      <section className="border-y border-border-subtle bg-bg-near py-16">
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="w-10 h-10 rounded bg-surface-graphite border border-border-silver/40 flex items-center justify-center text-blue-400">
                <ListOrdered className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white">
                01. Score Management & Rolling FIFO
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Digital Heroes is designed around Stableford scoring, making performance tracking
                rewarding for golfers of all handicaps.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <Card variant="default" className="space-y-4">
                <h3 className="text-lg font-medium text-white">Rule Specifications (PRD § 05)</h3>
                <div className="space-y-3 text-xs sm:text-sm text-text-secondary">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-blue-400 font-bold">1–45</span>
                    <span>
                      <strong className="text-white">Stableford Points Range:</strong> Scores must be
                      valid integers between 1 and 45.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-blue-400 font-bold">LATEST 5</span>
                    <span>
                      <strong className="text-white">Automatic Rolling Retention:</strong> The platform
                      retains only your latest 5 rounds. When you log a 6th round, it automatically
                      replaces your oldest stored round.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-red-500 font-bold">1 PER DATE</span>
                    <span>
                      <strong className="text-white">Duplicate Date Prohibition:</strong> Strictly one score
                      entry is permitted per date. Duplicate scores for the same date are forbidden — existing
                      entries may only be edited or deleted.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded bg-surface-graphite border border-border-subtle flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-text-muted">
                    Scores are displayed in reverse chronological order (most recent first) and are
                    locked when a monthly draw simulation occurs.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Pillar 2: Charity System */}
      <section className="py-16">
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="w-10 h-10 rounded bg-surface-graphite border border-border-silver/40 flex items-center justify-center text-red-500">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white">
                02. Guaranteed Charitable Giving
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Charitable impact leads the platform&apos;s story. Every subscriber directs a guaranteed
                portion of their membership to a cause they choose.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <Card variant="default" className="space-y-4">
                <h3 className="text-lg font-medium text-white">Contribution Model (PRD § 08)</h3>
                <div className="space-y-3 text-xs sm:text-sm text-text-secondary">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-red-500 font-bold">MIN 10%</span>
                    <span>
                      <strong className="text-white">Platform Contribution Floor:</strong> A minimum of
                      10% of each subscription fee is automatically dedicated to the subscriber&apos;s chosen charity.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-red-500 font-bold">VOLUNTARY</span>
                    <span>
                      <strong className="text-white">Customizable Increase:</strong> Users may voluntarily
                      increase their charity contribution percentage above 10% through their dashboard.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-red-500 font-bold">DIRECT</span>
                    <span>
                      <strong className="text-white">Independent Donation Option:</strong> Visitors and
                      members can donate directly to any listed charity without participating in gameplay.
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Pillar 3: Draw & Verification System */}
      <section className="border-t border-border-subtle bg-bg-near py-16">
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="w-10 h-10 rounded bg-surface-graphite border border-border-silver/40 flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white">
                03. Draw Tiers & Scorecard Verification
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Monthly prize draws operate on a pre-defined distribution formula with audited winner
                verification before any funds are disbursed.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <Card variant="default" className="space-y-4">
                <h3 className="text-lg font-medium text-white">Prize Pool Distribution (PRD § 06 & § 07)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-border-subtle text-text-muted">
                        <th className="py-2.5">Match Type</th>
                        <th className="py-2.5">Pool Share</th>
                        <th className="py-2.5">Rollover?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-white">
                      <tr>
                        <td className="py-3 font-bold">5-Number Match</td>
                        <td className="py-3">40%</td>
                        <td className="py-3 text-red-400 font-bold">Yes — jackpot carries forward</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-bold">4-Number Match</td>
                        <td className="py-3">35%</td>
                        <td className="py-3 text-text-muted">No</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-bold">3-Number Match</td>
                        <td className="py-3">25%</td>
                        <td className="py-3 text-text-muted">No</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-border-subtle space-y-2">
                  <h4 className="text-xs font-mono uppercase text-white font-bold">
                    Winner Verification System (PRD § 09)
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Verification applies strictly to winners. To claim a prize, winning subscribers upload
                    an official golf platform screenshot confirming their scores. Administrators review and
                    approve the proof before payment transitions from Pending to Paid.
                  </p>
                </div>
              </Card>

              <div className="flex items-center justify-end gap-4 pt-4">
                <Link href="/charities">
                  <Button variant="silver" size="md">
                    Explore Charities
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="md">
                    Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
