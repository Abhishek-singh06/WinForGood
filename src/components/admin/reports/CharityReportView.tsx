"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { CharityReportItem } from "@/lib/reports/types";
import { HeartHandshake, AlertCircle, Info } from "lucide-react";

interface CharityReportViewProps {
  charities: CharityReportItem[];
}

export function CharityReportView({ charities }: CharityReportViewProps) {
  function formatPence(pence: number): string {
    return `£${(pence / 100).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  const totalSubPence = charities.reduce((acc, c) => acc + c.subscriptionCharityPence, 0);
  const totalUnclaimedPence = charities.reduce((acc, c) => acc + c.unclaimedPrizeDisbursedPence, 0);
  const grandTotalPence = totalSubPence + totalUnclaimedPence;

  return (
    <Card variant="default" className="space-y-6 border-border-subtle p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-serif font-medium text-white">
              Charity Contribution Totals &amp; Partner Directory
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            PRD § 08 &amp; § 11.05: Directory breakdown of vetted partners, active subscriber designations, and routed funds.
          </p>
        </div>

        <Badge variant="charcoal" className="font-mono text-[10px]">
          Data Source: public.charities + profiles
        </Badge>
      </div>

      {/* Mandatory Accounting Separation Callout */}
      <div className="p-3.5 rounded bg-surface-charcoal border border-border-subtle flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white font-mono text-[11px] block">
            Accounting Stream Separation Mandate (PRD § 08 &amp; Decision #8)
          </span>
          <p className="text-text-secondary text-[11px] leading-relaxed">
            In compliance with platform financial audit standards, <strong>Direct Subscription Contributions</strong> (statutory 10% floor with voluntary member additions) and <strong>Unclaimed Prize Dispositions</strong> (unwon 4-match and 3-match tier pools under Assumption TA-006) are strictly maintained as independent ledgers and never blended into an ambiguous lump sum.
          </p>
        </div>
      </div>

      {charities.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border-subtle rounded bg-surface-charcoal/40 space-y-2">
          <AlertCircle className="w-6 h-6 text-text-muted mx-auto" />
          <h3 className="text-sm font-medium text-white">
            No charity contribution data for this period.
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            No active charity records or designated contributions were found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase">
                <th className="py-2.5 px-3">Vetted Charity Partner</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Associated Members</th>
                <th className="py-2.5 px-3 text-right">Avg Contribution %</th>
                <th className="py-2.5 px-3 text-right text-blue-300">A: Direct Subscription Donations</th>
                <th className="py-2.5 px-3 text-right text-yellow-300">B: Unclaimed Prize Disbursed</th>
                <th className="py-2.5 px-3 text-right font-bold text-white">Total Charity Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-secondary">
              {charities.map((c) => (
                <tr key={c.charityId} className="hover:bg-surface-charcoal/50">
                  <td className="py-3 px-3 text-white font-medium">
                    {c.name}
                  </td>
                  <td className="py-3 px-3 text-text-muted">
                    {c.category}
                  </td>
                  <td className="py-3 px-3 text-right text-white font-bold">
                    {c.associatedSubscribers}
                  </td>
                  <td className="py-3 px-3 text-right text-text-muted">
                    {c.avgContributionPercentage}%
                  </td>
                  <td className="py-3 px-3 text-right text-blue-300 font-medium">
                    {formatPence(c.subscriptionCharityPence)}
                  </td>
                  <td className="py-3 px-3 text-right text-yellow-300 font-medium">
                    {c.unclaimedPrizeDisbursedPence > 0
                      ? formatPence(c.unclaimedPrizeDisbursedPence)
                      : "—"}
                  </td>
                  <td className="py-3 px-3 text-right text-white font-bold">
                    {formatPence(c.totalCharityPence)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border-subtle font-bold text-white bg-surface-charcoal/30">
                <td colSpan={4} className="py-3 px-3 text-left">
                  Grand Totals (All Supported Charities)
                </td>
                <td className="py-3 px-3 text-right text-blue-300">
                  {formatPence(totalSubPence)}
                </td>
                <td className="py-3 px-3 text-right text-yellow-300">
                  {formatPence(totalUnclaimedPence)}
                </td>
                <td className="py-3 px-3 text-right text-white">
                  {formatPence(grandTotalPence)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}
