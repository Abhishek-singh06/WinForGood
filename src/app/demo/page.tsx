"use client";

/**
 * Demo Dashboard — Overview Page
 *
 * Mirrors the production dashboard overview with demo data.
 * All data comes from the DemoProvider context — no server calls.
 */

import React from "react";
import Link from "next/link";
import { useDemoContext } from "@/lib/demo/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ListOrdered,
  Heart,
  Sparkles,
  Trophy,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function DemoDashboardPage() {
  const { user, subscription, totalWinnings, scores, selectedCharity, charityPercentage } = useDemoContext();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">Demo Portal</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Welcome back, {user.full_name}.
          </h1>
          <p className="text-xs text-text-secondary">
            This is a demo dashboard with sample data. No real account is active.
          </p>
        </div>

        <Link href="/demo/scores">
          <Button variant="primary" size="sm" className="font-mono text-xs uppercase">
            Log Latest Score <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Subscription Status */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 01</span>
            <Badge variant="blue">{subscription.statusLabel}</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Subscription Status</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Active {subscription.plan} membership. Full access to all platform features.
            <span className="block text-blue-400/60 mt-1 text-[11px] font-mono">DEMO — Sample data</span>
          </p>
          <div className="pt-2 text-xs font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-text-secondary">
              Renews: {new Date(subscription.current_period_end).toLocaleDateString("en-GB", {
                month: "short", day: "numeric", year: "numeric"
              })}
            </span>
          </div>
          <div className="pt-1">
            <Link href="/demo/account">
              <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                Manage Subscription <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 2: Score Management */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 02</span>
            <Badge variant="blue">Stableford 1–45</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Rolling 5-Score Record</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your latest {scores.length} rounds: {scores.map(s => s.score).join(", ")} pts.
            <span className="block text-blue-400/60 mt-1 text-[11px] font-mono">DEMO — Sample scores</span>
          </p>
          <div className="pt-2">
            <Link href="/demo/scores">
              <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                View Scorecard <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 3: Selected Charity */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 03</span>
            <Badge variant="red">Min 10% Floor</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Charity Allocation</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Directing {charityPercentage}% to {selectedCharity.name}.
            <span className="block text-blue-400/60 mt-1 text-[11px] font-mono">DEMO — Sample charity</span>
          </p>
          <div className="pt-2">
            <Link href="/demo/charity">
              <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                Manage Cause <Heart className="w-3.5 h-3.5 ml-1 text-red-500" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 4: Draw Participation */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 04</span>
            <Badge variant="charcoal">Monthly Draw</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Draw Participation</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Track entered monthly draws and upcoming prize pools.
            <span className="block text-blue-400/60 mt-1 text-[11px] font-mono">DEMO — Sample draw data</span>
          </p>
          <div className="pt-2">
            <Link href="/demo/draws">
              <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                Draw Center <Sparkles className="w-3.5 h-3.5 ml-1 text-blue-400" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 5: Winnings */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 05</span>
            <Badge variant="charcoal">Audited Verification</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Winnings & Proofs</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Total demo earnings: £{totalWinnings.toFixed(2)} across {2} prize draws.
            <span className="block text-blue-400/60 mt-1 text-[11px] font-mono">DEMO — Sample winnings</span>
          </p>
          <div className="pt-2">
            <Link href="/demo/winnings">
              <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                View Earnings <Trophy className="w-3.5 h-3.5 ml-1 text-text-silver" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
