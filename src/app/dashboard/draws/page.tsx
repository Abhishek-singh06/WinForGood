import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getPublishedDraws,
  getUserDrawEntry,
  getUserWinningRecord,
} from "@/lib/draws/actions";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { resolveSubscriptionAccess } from "@/lib/subscriptions/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { defaultScoreMapper } from "@/lib/draws/mapper";
import { defaultEligibilityResolver } from "@/lib/draws/eligibility";
import {
  Sparkles,
  Calendar,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Ticket,
  AlertCircle,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DrawsDashboardPage() {
  const auth = await getCurrentUserAndProfile();
  const userId = auth?.user?.id;

  // Check subscription access
  let hasActiveSubscription = false;
  let userScores: number[] = [];

  if (userId) {
    const access = await resolveSubscriptionAccess(userId);
    hasActiveSubscription = access.hasAccess;

    // Fetch user's rolling scores
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (!supabaseUrl.includes("placeholder")) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: scoreRows } = await supabase
          .from("scores")
          .select("score")
          .eq("user_id", userId)
          .order("score_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5);

        if (scoreRows) {
          userScores = scoreRows.map((s) => s.score);
        }
      } catch {
        userScores = [];
      }
    }
  }

  // Generate dynamic ticket (Model B: TA-002)
  const userTicket = defaultScoreMapper.mapScoresToTicket(userScores);
  const ticketPotential = defaultEligibilityResolver.evaluateTicketPotential(userTicket);

  // Fetch published draws
  const publishedDraws = await getPublishedDraws();

  // For the latest published draw, fetch user entry & winning record if available
  let latestUserEntry = null;
  let latestWinnerRecord = null;
  const latestDraw = publishedDraws[0] || null;

  if (latestDraw && userId) {
    [latestUserEntry, latestWinnerRecord] = await Promise.all([
      getUserDrawEntry(latestDraw.id, userId),
      getUserWinningRecord(latestDraw.id, userId),
    ]);
  }

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

        <Link href="/dashboard/scores">
          <Button variant="silver" size="sm" className="font-mono text-xs uppercase">
            Manage Scores <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Subscription Status Card */}
      {!hasActiveSubscription ? (
        <Card variant="gradient" className="border-border-silver p-5 space-y-3">
          <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs font-bold uppercase">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Active Membership Required for Draw Participation</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Monthly draw entries are tied to active membership. Set up your subscription to participate in all upcoming monthly prize pools.
          </p>
          <div className="pt-1">
            <Link href="/pricing">
              <Button variant="primary" size="sm" className="font-mono text-xs uppercase">
                Choose Plan (£10/mo or £100/yr)
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
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

              {userTicket.length === 0 ? (
                <div className="p-4 rounded bg-surface-charcoal border border-border-subtle text-center space-y-2">
                  <AlertCircle className="w-5 h-5 text-text-muted mx-auto" />
                  <span className="text-xs text-text-secondary block">
                    No scores logged yet. Add your Stableford rounds (1–45 pts) to populate your ticket.
                  </span>
                  <Link href="/dashboard/scores">
                    <Button variant="silver" size="sm" className="font-mono text-xs">
                      Log First Round
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {userTicket.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-11 h-11 rounded-full bg-surface-charcoal border border-blue-500/50 flex items-center justify-center font-mono font-bold text-white text-base shadow-sm"
                    >
                      {String(num).padStart(2, "0")}
                    </div>
                  ))}
                  {Array.from({ length: 5 - userTicket.length }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="w-11 h-11 rounded-full border border-dashed border-border-subtle flex items-center justify-center font-mono text-text-muted text-xs"
                    >
                      —
                    </div>
                  ))}
                </div>
              )}

              {/* Potential Eligibility Status */}
              <div className="pt-2 text-xs font-mono space-y-1 text-text-secondary border-t border-border-subtle/50">
                <div className="flex justify-between">
                  <span>Logged Scores:</span>
                  <span className="text-white">{userScores.length} of 5</span>
                </div>
                <div className="flex justify-between">
                  <span>Distinct Numbers:</span>
                  <span className="text-white">{ticketPotential.distinctCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Achievable Tier:</span>
                  <span className="text-blue-400 font-bold">
                    {ticketPotential.maxAchievableTier
                      ? ticketPotential.maxAchievableTier.replace("_", " ").toUpperCase()
                      : "None (Minimum 3 distinct scores required to win)"}
                  </span>
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE SUBSCRIBER
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Cadence</span>
                <span className="text-white">Monthly Automatic Entry</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Charity Allocation</span>
                <span className="text-text-silver">Min 10% designated</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Statutory Match Tier Cards (PRD § 06 & § 07) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="gradient" className="space-y-3 border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Tier 1</span>
            <Badge variant="red">40% Share</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">5-Number Match</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Matches all 5 drawn numbers. Rollover:{" "}
            <strong className="text-red-400">YES — jackpot carries forward</strong> if unclaimed.
          </p>
        </Card>

        <Card variant="gradient" className="space-y-3 border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Tier 2</span>
            <Badge variant="charcoal">35% Share</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">4-Number Match</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Matches 4 of 5 drawn numbers. Rollover: <span className="text-text-muted">NO</span>.
            If unclaimed, assigned to vetted charity pool.
          </p>
        </Card>

        <Card variant="gradient" className="space-y-3 border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Tier 3</span>
            <Badge variant="charcoal">25% Share</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">3-Number Match</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Matches 3 of 5 drawn numbers. Rollover: <span className="text-text-muted">NO</span>.
            If unclaimed, assigned to vetted charity pool.
          </p>
        </Card>
      </div>

      {/* Latest Published Draw Result (If any) */}
      {latestDraw && (
        <Card variant="gradient" className="space-y-4 border-blue-900/40 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div>
              <span className="text-xs font-mono text-blue-400 uppercase tracking-wider block">
                Latest Published Draw Result
              </span>
              <h3 className="text-lg font-serif font-medium text-white">
                Cycle #{latestDraw.draw_number} — {new Date(latestDraw.month).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </h3>
            </div>
            <Badge variant="blue">Published &amp; Immutable</Badge>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
              Official Winning Numbers
            </span>
            <div className="flex items-center gap-2.5">
              {latestDraw.winning_numbers?.map((num, idx) => (
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
          {latestUserEntry ? (
            <div className="p-3.5 rounded bg-surface-charcoal border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Your Entered Ticket</span>
                <span className="text-white font-bold">
                  [{latestUserEntry.numbers.map((n) => String(n).padStart(2, "0")).join(", ")}]
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Matches</span>
                <span className="text-blue-400 font-bold">
                  {latestUserEntry.match_count} of 5 numbers matched
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Result</span>
                {latestWinnerRecord ? (
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> Won £{Number(latestWinnerRecord.prize_amount || 0).toFixed(2)} ({latestWinnerRecord.match_tier.replace("_", " ")})
                  </span>
                ) : (
                  <span className="text-text-muted">No Prize (Min 3 required)</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">
              You were not registered in this draw cycle.
            </p>
          )}
        </Card>
      )}

      {/* Published Draws History */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-medium text-white">
          Historical Draws
        </h3>

        {publishedDraws.length === 0 ? (
          <Card variant="default" className="text-center py-12 space-y-2">
            <Calendar className="w-6 h-6 text-text-muted mx-auto" />
            <span className="text-xs font-mono text-text-muted block">
              No Published Draws Yet
            </span>
            <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
              Published monthly draw results and winning numbers will appear here once finalized by administrators.
            </p>
          </Card>
        ) : (
          publishedDraws.map((draw) => (
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
          ))
        )}
      </div>
    </div>
  );
}
