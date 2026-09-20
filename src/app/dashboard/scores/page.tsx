import React from "react";
import { getUserScores } from "@/lib/scores/actions";
import { ScoreManager } from "@/components/scores/ScoreManager";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function ScoresDashboardPage() {
  const scores = await getUserScores();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">Stableford Pool</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Golf Performance Scores
          </h1>
          <p className="text-xs text-text-secondary">
            PRD § 05 & BR-020: Submit official 18-hole Stableford scores (1–45 pts). Your rolling pool retains your newest 5 rounds.
          </p>
        </div>
      </div>

      {/* Interactive Manager */}
      <ScoreManager initialScores={scores} />
    </div>
  );
}
