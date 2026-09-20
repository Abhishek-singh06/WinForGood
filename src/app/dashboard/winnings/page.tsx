import React from "react";
import { Badge } from "@/components/ui/Badge";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { getUserWinningsList } from "@/lib/winners/actions";
import { SubscriberWinningsManager } from "@/components/winnings/SubscriberWinningsManager";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WinningsDashboardPage() {
  const auth = await getCurrentUserAndProfile();
  if (!auth) {
    redirect("/login");
  }

  const winnings = await getUserWinningsList(auth.user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">PRD § 09 / § 10</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Winnings &amp; Proof Submissions
          </h1>
          <p className="text-xs text-text-secondary">
            View your prize payouts, track verification progress, and upload official scorecard screenshots to claim prizes.
          </p>
        </div>
      </div>

      <SubscriberWinningsManager initialWinnings={winnings} />
    </div>
  );
}
