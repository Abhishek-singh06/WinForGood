import React from "react";
import Link from "next/link";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { resolveSubscriptionAccess } from "@/lib/subscriptions/resolver";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ListOrdered,
  Heart,
  Sparkles,
  Trophy,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authData = await getCurrentUserAndProfile();
  const profile = authData?.profile;
  const user = authData?.user;

  // Resolve real subscription state for overview display
  const accessState = user?.id
    ? await resolveSubscriptionAccess(user.id)
    : { hasAccess: false, subscription: null, statusLabel: "No Subscription", inGracePeriod: false };

  const subscriptionBadgeVariant = accessState.hasAccess
    ? accessState.inGracePeriod ? "red" : "blue"
    : "charcoal";

  const SubscriptionIcon = accessState.hasAccess
    ? accessState.inGracePeriod ? Clock : CheckCircle2
    : AlertTriangle;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">Member Portal</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Welcome back, {profile?.full_name || "Subscriber"}.
          </h1>
          <p className="text-xs text-text-secondary">
            Your centralized performance, charitable giving, and monthly prize draw overview.
          </p>
        </div>

        <Link href="/dashboard/scores">
          <Button variant="primary" size="sm" className="font-mono text-xs uppercase">
            Log Latest Score <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* 5 PRD Module Cards Overview (§ 10 User Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Subscription Status (§ 10.1) */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 01</span>
            <Badge variant={subscriptionBadgeVariant}>
              {accessState.statusLabel}
            </Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Subscription Status</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {accessState.hasAccess
              ? accessState.inGracePeriod
                ? "Your subscription is scheduled to cancel at the end of the billing period."
                : `Active ${accessState.subscription?.plan || ""} membership. You have full access to all platform features.`
              : "No active subscription. Subscribe to unlock platform features and monthly draws."}
          </p>
          <div className="pt-2 text-xs font-mono flex items-center gap-1.5">
            <SubscriptionIcon className={`w-3.5 h-3.5 ${
              accessState.hasAccess
                ? accessState.inGracePeriod ? "text-red-400" : "text-blue-400"
                : "text-text-muted"
            }`} />
            {accessState.subscription?.current_period_end ? (
              <span className="text-text-secondary">
                {accessState.subscription.cancel_at_period_end ? "Access Until" : "Renews"}:{" "}
                {new Date(accessState.subscription.current_period_end).toLocaleDateString("en-GB", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </span>
            ) : (
              <span className="text-text-muted">
                {accessState.hasAccess ? "Active subscription" : "No active subscription"}
              </span>
            )}
          </div>
          <div className="pt-1">
            <Link href="/dashboard/account">
              <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                Manage Subscription <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 2: Score Management (§ 10.2) */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 02</span>
            <Badge variant="blue">Stableford 1–45</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Rolling 5-Score Record</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Retains your latest 5 rounds in reverse chronological order. Each new entry automatically
            replaces the oldest stored score.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/scores">
              <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                View Scorecard <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 3: Selected Charity (§ 10.3) */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 03</span>
            <Badge variant="red">Min 10% Floor</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Charity Allocation</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Directing at least 10% of subscription fees to your chosen cause. Adjust voluntary
            percentages or explore upcoming partner events.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/charity">
              <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                Manage Cause <Heart className="w-3.5 h-3.5 ml-1 text-red-500" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 4: Participation Summary (§ 10.4) */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 04</span>
            <Badge variant="charcoal">Monthly Draw</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Draw Participation</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Tracks entered monthly draws and upcoming prize pools. 5-number match features a 40% pool
            share with jackpot rollover.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/draws">
              <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                Draw Center <Sparkles className="w-3.5 h-3.5 ml-1 text-blue-400" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 5: Winnings Overview (§ 10.5) */}
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Module 05</span>
            <Badge variant="charcoal">Audited Verification</Badge>
          </div>
          <h2 className="text-lg font-serif font-medium text-white">Winnings & Proofs</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Inspect total prize winnings, track verification reviews, and upload official scorecard
            proofs for winning draws.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/winnings">
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
