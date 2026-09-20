"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { DrawHistoryReportItem } from "@/lib/reports/types";
import { Trophy, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DrawHistoryReportViewProps {
  draws: DrawHistoryReportItem[];
}

export function DrawHistoryReportView({ draws }: DrawHistoryReportViewProps) {
  function formatPence(pence: number): string {
    return `£${(pence / 100).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <Card variant="default" className="space-y-6 border-border-subtle p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h2 className="text-base font-serif font-medium text-white">
              Monthly Draw History &amp; Prize Dispositions
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            PRD § 06 &amp; § 11.05: Published monthly draw cycles, participant counts, winning balls, tier allocations, and rollovers.
          </p>
        </div>

        <Badge variant="charcoal" className="font-mono text-[10px]">
          Data Source: public.draws + draw_tier_allocations
        </Badge>
      </div>

      {draws.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border-subtle rounded bg-surface-charcoal/40 space-y-2">
          <AlertCircle className="w-6 h-6 text-text-muted mx-auto" />
          <h3 className="text-sm font-medium text-white">
            No published draws for this period.
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            No draw cycles match the selected date boundary. Select a wider date filter or verify scheduled monthly cycles.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase">
                <th className="py-2.5 px-3">Draw</th>
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-center">Winning Balls</th>
                <th className="py-2.5 px-3 text-right">Participants</th>
                <th className="py-2.5 px-3 text-right">Tier 5 (40%)</th>
                <th className="py-2.5 px-3 text-right">Tier 4 (35%)</th>
                <th className="py-2.5 px-3 text-right">Tier 3 (25%)</th>
                <th className="py-2.5 px-3 text-right">Rollover In / Out</th>
                <th className="py-2.5 px-3 text-right">Unclaimed Lower Tier</th>
                <th className="py-2.5 px-3 text-right font-bold text-white">Gross Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-secondary">
              {draws.map((d) => (
                <tr key={d.id} className="hover:bg-surface-charcoal/50">
                  {/* Draw Number */}
                  <td className="py-3 px-3 text-white font-bold">
                    #{d.drawNumber}
                  </td>

                  {/* Month */}
                  <td className="py-3 px-3 text-text-muted">
                    {new Date(d.month).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </td>

                  {/* Mode */}
                  <td className="py-3 px-3">
                    <Badge variant={d.mode === "algorithmic" ? "blue" : "silver"} className="text-[10px]">
                      {d.mode.toUpperCase()}
                    </Badge>
                  </td>

                  {/* Winning Numbers */}
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-1">
                      {d.winningNumbers.map((num) => (
                        <span
                          key={num}
                          className="w-5 h-5 rounded-full bg-surface-graphite text-blue-300 border border-blue-500/40 text-[10px] font-bold flex items-center justify-center"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Participants */}
                  <td className="py-3 px-3 text-right text-white">
                    {d.participantCount}
                  </td>

                  {/* Tier 5 */}
                  <td className="py-3 px-3 text-right">
                    <span className="text-white block font-medium">
                      {formatPence(d.tier5AllocationPence)}
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      {d.tier5WinnerCount} winner{d.tier5WinnerCount !== 1 ? "s" : ""}
                    </span>
                  </td>

                  {/* Tier 4 */}
                  <td className="py-3 px-3 text-right">
                    <span className="text-white block font-medium">
                      {formatPence(d.tier4AllocationPence)}
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      {d.tier4WinnerCount} winner{d.tier4WinnerCount !== 1 ? "s" : ""}
                    </span>
                  </td>

                  {/* Tier 3 */}
                  <td className="py-3 px-3 text-right">
                    <span className="text-white block font-medium">
                      {formatPence(d.tier3AllocationPence)}
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      {d.tier3WinnerCount} winner{d.tier3WinnerCount !== 1 ? "s" : ""}
                    </span>
                  </td>

                  {/* Rollover In / Out */}
                  <td className="py-3 px-3 text-right text-[11px]">
                    {d.jackpotRolloverInPence > 0 && (
                      <span className="text-blue-400 flex items-center justify-end gap-0.5">
                        <ArrowDownRight className="w-3 h-3" /> +{formatPence(d.jackpotRolloverInPence)}
                      </span>
                    )}
                    {d.jackpotRolloverOutPence > 0 ? (
                      <span className="text-yellow-400 flex items-center justify-end gap-0.5">
                        <ArrowUpRight className="w-3 h-3" /> Roll: {formatPence(d.jackpotRolloverOutPence)}
                      </span>
                    ) : (
                      <span className="text-text-muted">Won</span>
                    )}
                  </td>

                  {/* Lower-Tier Unclaimed (To Charity) */}
                  <td className="py-3 px-3 text-right">
                    {d.unclaimedLowerTierPence > 0 ? (
                      <span className="text-yellow-300 font-medium">
                        {formatPence(d.unclaimedLowerTierPence)}
                        <span className="block text-[9px] text-text-muted">Routed to Charity</span>
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>

                  {/* Total Gross Prize */}
                  <td className="py-3 px-3 text-right text-white font-bold">
                    {formatPence(d.totalPrizePence)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
