"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { FinancialSummaryReport } from "@/lib/reports/types";
import { DollarSign, ShieldAlert, FileText } from "lucide-react";

interface FinancialSummaryViewProps {
  financials: FinancialSummaryReport;
}

export function FinancialSummaryView({ financials }: FinancialSummaryViewProps) {
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
            <DollarSign className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-serif font-medium text-white">
              Platform Financial Summary Ledger
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            PRD § 07 &amp; § 11.05: Complete financial balance sheet across subscription intake, prize allocations, rollovers, and payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" className="font-mono text-[10px]">
            Currency: {financials.currency}
          </Badge>
          {financials.isTemporaryAssumption && (
            <Badge variant="silver" className="font-mono text-[10px]">
              Temporary Business Parameters
            </Badge>
          )}
        </div>
      </div>

      {/* Temporary Business Parameters Disclosure */}
      <div className="p-3.5 rounded bg-surface-charcoal border border-border-subtle flex items-start gap-3 text-xs">
        <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white font-mono text-[11px] block">
            Temporary Commercial Assumptions In Effect (A-020 / TA-001–TA-006)
          </span>
          <p className="text-text-secondary text-[11px] leading-relaxed">
            The figures below reflect the operational configuration assumptions: Monthly subscription = £10.00, Prize Pool allocation = 30% MER, Currency = GBP (£), and Unclaimed Lower-Tier Prize Funds routed to Charity. These values are configuration-driven implementation parameters, not definitive PRD mandates.
          </p>
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase">
              <th className="py-2.5 px-3">Accounting Category</th>
              <th className="py-2.5 px-3">Operational Basis / Formula</th>
              <th className="py-2.5 px-3 text-right">Amount (GBP £)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-secondary">
            {/* Revenue & Pool Section */}
            <tr className="bg-surface-charcoal/20">
              <td colSpan={3} className="py-2 px-3 text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                1. Subscription Intake &amp; Pool Generation
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Subscription Revenue Basis</td>
              <td className="py-2.5 px-3 text-text-muted">Active subscribers × Monthly Equivalent Rate (£10.00)</td>
              <td className="py-2.5 px-3 text-right text-white font-bold">
                {formatPence(financials.subscriptionRevenueBasisPence)}
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Prize Pool Contribution</td>
              <td className="py-2.5 px-3 text-text-muted">30% of active monthly subscription revenue (TA-001)</td>
              <td className="py-2.5 px-3 text-right text-blue-300 font-bold">
                {formatPence(financials.prizePoolContributionPence)}
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Gross Draw Prize Pool</td>
              <td className="py-2.5 px-3 text-text-muted">Total pool allocated across published monthly draws</td>
              <td className="py-2.5 px-3 text-right text-yellow-300 font-bold">
                {formatPence(financials.grossPrizePoolPence)}
              </td>
            </tr>

            {/* Tier Allocation Section */}
            <tr className="bg-surface-charcoal/20">
              <td colSpan={3} className="py-2 px-3 text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                2. Prize Tier Distributions (PRD § 07)
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Tier 5 (Jackpot) Allocation</td>
              <td className="py-2.5 px-3 text-text-muted">40% of pool + incoming rollovers (Rollover Out: {formatPence(financials.jackpotRolloverOutPence)})</td>
              <td className="py-2.5 px-3 text-right text-white">
                {formatPence(financials.tier5AllocationPence)}
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Tier 4 Match Allocation</td>
              <td className="py-2.5 px-3 text-text-muted">35% of pool (Unclaimed routed to charity)</td>
              <td className="py-2.5 px-3 text-right text-white">
                {formatPence(financials.tier4AllocationPence)}
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Tier 3 Match Allocation</td>
              <td className="py-2.5 px-3 text-text-muted">25% of pool (Unclaimed routed to charity)</td>
              <td className="py-2.5 px-3 text-right text-white">
                {formatPence(financials.tier3AllocationPence)}
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Unclaimed Lower-Tier Prize Funds</td>
              <td className="py-2.5 px-3 text-text-muted">Unwon Tier 4 &amp; Tier 3 allocations designated to charity (TA-006)</td>
              <td className="py-2.5 px-3 text-right text-yellow-400 font-medium">
                {formatPence(financials.unclaimedLowerTierPence)}
              </td>
            </tr>

            {/* Winnings Ledger Section */}
            <tr className="bg-surface-charcoal/20">
              <td colSpan={3} className="py-2 px-3 text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                3. Winner Payout State (PRD § 09)
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Paid Winnings</td>
              <td className="py-2.5 px-3 text-text-muted">Approved scorecard verification &amp; marked Paid by admin</td>
              <td className="py-2.5 px-3 text-right text-blue-400 font-bold">
                {formatPence(financials.paidWinningsPence)}
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Pending Winnings</td>
              <td className="py-2.5 px-3 text-text-muted">Awaiting proof submission or admin verification approval</td>
              <td className="py-2.5 px-3 text-right text-text-muted">
                {formatPence(financials.pendingWinningsPence)}
              </td>
            </tr>

            {/* Charity Disbursal Section */}
            <tr className="bg-surface-charcoal/20">
              <td colSpan={3} className="py-2 px-3 text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                4. Charity Commitments (PRD § 08)
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Direct Subscription Charity</td>
              <td className="py-2.5 px-3 text-text-muted">Direct subscriber allocation (&ge; 10% floor)</td>
              <td className="py-2.5 px-3 text-right text-blue-300">
                {formatPence(financials.subscriptionCharityPence)}
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50">
              <td className="py-2.5 px-3 text-white font-medium">Unclaimed Prize Charity Routing</td>
              <td className="py-2.5 px-3 text-text-muted">Unwon Tier 4 &amp; Tier 3 allocations (TA-006)</td>
              <td className="py-2.5 px-3 text-right text-yellow-300">
                {formatPence(financials.unclaimedCharityPence)}
              </td>
            </tr>
            <tr className="hover:bg-surface-charcoal/50 font-bold">
              <td className="py-3 px-3 text-white">Total Charity Allocation</td>
              <td className="py-3 px-3 text-text-muted">Combined total generated for vetted charitable partners</td>
              <td className="py-3 px-3 text-right text-white font-bold text-sm">
                {formatPence(financials.totalCharityPence)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
