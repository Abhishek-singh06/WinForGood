"use client";

import React from "react";
import Link from "next/link";
import { useDemoContext } from "@/lib/demo/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Calendar,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Ticket,
} from "lucide-react";

export default function DemoDrawsPage() {
  const {
    scores,
    latestDraw,
    previousDraws,
    userDrawEntry,
    upcomingDraw,
  } = useDemoContext();

  const userTicket = scores.map((s) => s.score);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">PRD § 10.4</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Draw Participation Center
          </h1>
          <p className="text-xs text-text-secondary">
            Your monthly draw entry, ticket tracking, and verified results ledger.
          </p>
        </div>

        <Link href="/demo/scores">
          <Button variant="silver" size="sm" className="font-mono text-xs uppercase">
            Manage Scores <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Ticket Card */}
        <Card variant="gradient" className="lg:col-span-2 space-y-4 border-border-subtle">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">
                My Active Draw Ticket
              </span>
            </div>
            <Badge variant="blue">Model B Dynamic Partial</Badge>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-mono text-text-muted uppercase">
              Numbers generated directly from your rolling scores (PRD § 06 / Decision #1):
            </span>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {userTicket.map((num, idx) => (
                <div
                  key={idx}
                  className="w-11 h-11 rounded-full bg-surface-charcoal border border-blue-500/50 flex items-center justify-center font-mono font-bold text-white text-base shadow-sm"
                >
                  {String(num).padStart(2, "0")}
                </div>
              ))}
            </div>

            {/* Potential Eligibility Status */}
            <div className="pt-2 text-xs font-mono space-y-1 text-text-secondary border-t border-border-subtle/50">
              <div className="flex justify-between">
                <span>Logged Scores:</span>
                <span className="text-white">{scores.length} of 5</span>
              </div>
              <div className="flex justify-between">
                <span>Distinct Numbers:</span>
                <span className="text-white">{new Set(userTicket).size}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Achievable Tier:</span>
                <span className="text-blue-400 font-bold">5 NUMBER MATCH</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Membership Status Summary */}
        <Card variant="default" className="space-y-4 border-border-subtle">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <ShieldCheck className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-medium text-white">
              Participation Status
            </span>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Membership</span>
              <span className="text-green-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE SUBSCRIBER (DEMO)
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Upcoming Draw</span>
              <span className="text-white">Cycle #{upcomingDraw.draw_number} — Oct 2026</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Estimated Pool</span>
              <span className="text-text-silver">£{upcomingDraw.total_pool.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Match Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="gradient" className="space-y-3 border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Tier 1</span>
            <Badge variant="red">40% Share</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">5-Number Match</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Matches all 5 drawn numbers. Rollover: <strong className="text-red-400">YES — jackpot carries forward</strong> if unclaimed.
          </p>
        </Card>

        <Card variant="gradient" className="space-y-3 border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Tier 2</span>
            <Badge variant="charcoal">35% Share</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">4-Number Match</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Matches 4 of 5 drawn numbers. Rollover: <span className="text-text-muted">NO</span>. Unclaimed funds allocated to charity.
          </p>
        </Card>

        <Card variant="gradient" className="space-y-3 border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Tier 3</span>
            <Badge variant="charcoal">25% Share</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">3-Number Match</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Matches 3 of 5 drawn numbers. Rollover: <span className="text-text-muted">NO</span>. Unclaimed funds allocated to charity.
          </p>
        </Card>
      </div>

      {/* Latest Published Draw */}
      <Card variant="gradient" className="space-y-4 border-blue-900/40 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div>
            <span className="text-xs font-mono text-blue-400 uppercase tracking-wider block">
              Latest Published Draw Result (Demo)
            </span>
            <h3 className="text-lg font-serif font-medium text-white">
              Cycle #{latestDraw.draw_number} — September 2026
            </h3>
          </div>
          <Badge variant="blue">Published</Badge>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
            Official Winning Numbers
          </span>
          <div className="flex items-center gap-2.5">
            {latestDraw.winning_numbers.map((num, idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-full bg-gradient-to-b from-surface-silver/20 to-surface-charcoal border border-border-silver/60 flex items-center justify-center font-mono font-bold text-white text-base shadow-inner"
              >
                {String(num).padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>

        {/* User Result in Latest Draw */}
        <div className="p-3.5 rounded bg-surface-charcoal border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <span className="text-text-muted block text-[10px] uppercase">Your Entered Ticket</span>
            <span className="text-white font-bold">
              [{userDrawEntry.numbers.map((n) => String(n).padStart(2, "0")).join(", ")}]
            </span>
          </div>
          <div>
            <span className="text-text-muted block text-[10px] uppercase">Matches</span>
            <span className="text-blue-400 font-bold">
              {userDrawEntry.match_count} of 5 numbers matched ({userDrawEntry.matched_numbers.join(", ")})
            </span>
          </div>
          <div>
            <span className="text-text-muted block text-[10px] uppercase">Result</span>
            <span className="text-green-400 font-bold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Won £288.75 (Tier 3 Match)
            </span>
          </div>
        </div>
      </Card>

      {/* Historical Draws */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-medium text-white">
          Historical Draws (Demo Data)
        </h3>
        {previousDraws.map((draw) => (
          <Card key={draw.id} variant="default" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white">
                Draw #{draw.draw_number} — {new Date(draw.month).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
              <Badge variant="blue">Published</Badge>
            </div>
            <div className="text-xs font-mono text-text-secondary flex items-center gap-2">
              <span>Winning Numbers:</span>
              <span className="text-white font-bold">
                {draw.winning_numbers ? draw.winning_numbers.join(", ") : "—"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
