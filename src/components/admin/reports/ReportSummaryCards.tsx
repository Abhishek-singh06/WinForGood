"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import type { ReportSummaryCards as SummaryCardsType } from "@/lib/reports/types";
import { Users, UserCheck, Trophy, CheckCircle, HeartHandshake } from "lucide-react";

interface ReportSummaryCardsProps {
  summary: SummaryCardsType;
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  function formatPence(pence: number): string {
    return `£${(pence / 100).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  const activePct =
    summary.totalSubscribers > 0
      ? ((summary.activeSubscribers / summary.totalSubscribers) * 100).toFixed(1)
      : "0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Subscribers */}
      <Card variant="gradient" className="space-y-2 border-border-subtle">
        <div className="flex items-center justify-between text-text-muted">
          <span className="text-[10px] font-mono uppercase tracking-wider">Total Subscribers</span>
          <Users className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-3xl font-serif font-bold text-white block">
          {summary.totalSubscribers}
        </span>
        <span className="text-[11px] font-mono text-text-muted block">
          Active: <strong className="text-white">{summary.activeSubscribers}</strong> | Lapsed:{" "}
          <strong className="text-white">{summary.totalSubscribers - summary.activeSubscribers}</strong>
        </span>
      </Card>

      {/* Active Subscribers */}
      <Card variant="gradient" className="space-y-2 border-border-subtle">
        <div className="flex items-center justify-between text-text-muted">
          <span className="text-[10px] font-mono uppercase tracking-wider">Active Cohort</span>
          <UserCheck className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-3xl font-serif font-bold text-blue-400 block">
          {summary.activeSubscribers}
        </span>
        <span className="text-[11px] font-mono text-text-muted block">
          {activePct}% active retention rate
        </span>
      </Card>

      {/* Total Prize Pool */}
      <Card variant="gradient" className="space-y-2 border-border-subtle">
        <div className="flex items-center justify-between text-text-muted">
          <span className="text-[10px] font-mono uppercase tracking-wider">Gross Prize Pool</span>
          <Trophy className="w-4 h-4 text-yellow-400" />
        </div>
        <span className="text-3xl font-serif font-bold text-white block">
          {formatPence(summary.totalPrizePoolPence)}
        </span>
        <span className="text-[11px] font-mono text-text-muted block">
          Allocated across published draws
        </span>
      </Card>

      {/* Paid Winnings */}
      <Card variant="gradient" className="space-y-2 border-border-subtle">
        <div className="flex items-center justify-between text-text-muted">
          <span className="text-[10px] font-mono uppercase tracking-wider">Disbursed Payouts</span>
          <CheckCircle className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-3xl font-serif font-bold text-white block">
          {formatPence(summary.paidWinningsPence)}
        </span>
        <span className="text-[11px] font-mono text-text-muted block">
          Verified &amp; paid to winners
        </span>
      </Card>
    </div>
  );
}
