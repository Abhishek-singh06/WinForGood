"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { SubscriberGrowthReport } from "@/lib/reports/types";
import { TrendingUp, Users, AlertCircle } from "lucide-react";

interface SubscriberGrowthViewProps {
  growth: SubscriberGrowthReport;
}

export function SubscriberGrowthView({ growth }: SubscriberGrowthViewProps) {
  const maxRegistrations = Math.max(
    ...growth.monthlyTrend.map((m) => m.newRegistrations),
    1
  );

  return (
    <Card variant="default" className="space-y-6 border-border-subtle p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-serif font-medium text-white">
              Subscriber Growth &amp; Historical Registrations
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            PRD § 11.05: Monthly new subscriber intake and cumulative registration trajectory.
          </p>
        </div>

        <Badge variant="charcoal" className="font-mono text-[10px]">
          Data Source: public.subscriptions
        </Badge>
      </div>

      {/* Distinction Banner: Current Snapshot vs Historical Trend */}
      <div className="p-3 rounded bg-surface-charcoal border border-border-subtle grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="space-y-0.5">
          <span className="text-[10px] text-text-muted uppercase block">
            Current Snapshot Status
          </span>
          <span className="text-white font-bold">
            {growth.currentActive} Active / {growth.currentInactive} Inactive
          </span>
          <span className="text-[10px] text-text-muted block">
            Real-time state from subscriptions ledger
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-text-muted uppercase block">
            Total Account Registrations
          </span>
          <span className="text-white font-bold">
            {growth.currentTotal} Total Accounts
          </span>
          <span className="text-[10px] text-text-muted block">
            Persistent profiles with subscriber role
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-text-muted uppercase block">
            Audit Limitation Notice
          </span>
          <span className="text-blue-300 font-medium">
            Creation-timestamp aggregation
          </span>
          <span className="text-[10px] text-text-muted block">
            Historical graphs reflect account creation dates
          </span>
        </div>
      </div>

      {/* Visual Monthly Trend Bars */}
      {growth.monthlyTrend.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border-subtle rounded bg-surface-charcoal/40 space-y-2">
          <AlertCircle className="w-6 h-6 text-text-muted mx-auto" />
          <h3 className="text-sm font-medium text-white">
            Historical growth data is not available for this period.
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            No subscriber registration timestamps fall within the selected date boundary. Select a wider range such as &ldquo;All Time&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase text-text-muted block">
            Monthly Registrations (Paced Bar Trend)
          </span>

          <div className="space-y-3">
            {growth.monthlyTrend.map((m) => {
              const widthPct = Math.round((m.newRegistrations / maxRegistrations) * 100);
              return (
                <div key={m.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{m.month}</span>
                    <span className="text-text-muted">
                      <strong className="text-blue-400">+{m.newRegistrations}</strong> new subscribers (Cumulative: {m.cumulativeSubscribers})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-graphite rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monthly Trend Table */}
          <div className="pt-2">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase">
                  <th className="py-2">Calendar Month</th>
                  <th className="py-2 text-right">New Registrations</th>
                  <th className="py-2 text-right">Cumulative Total</th>
                  <th className="py-2 text-right">Growth Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-secondary">
                {growth.monthlyTrend.map((m, idx) => {
                  const prev = idx > 0 ? growth.monthlyTrend[idx - 1].cumulativeSubscribers : 0;
                  const rate = prev > 0 ? `+${(((m.newRegistrations) / prev) * 100).toFixed(1)}%` : "Baseline";
                  return (
                    <tr key={m.month} className="hover:bg-surface-charcoal/50">
                      <td className="py-2 text-white font-medium">{m.month}</td>
                      <td className="py-2 text-right text-blue-400">+{m.newRegistrations}</td>
                      <td className="py-2 text-right text-white font-bold">{m.cumulativeSubscribers}</td>
                      <td className="py-2 text-right text-text-muted">{rate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
