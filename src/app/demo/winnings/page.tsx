"use client";

import React from "react";
import { useDemoContext } from "@/lib/demo/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

export default function DemoWinningsPage() {
  const { winnings, totalWinnings } = useDemoContext();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">PRD § 09 / § 10</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Winnings &amp; Proof Submissions
          </h1>
          <p className="text-xs text-text-secondary">
            Demo winnings ledger — track verified prize disbursements and scorecard submissions.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-text-muted uppercase block">Total Won (Demo)</span>
          <span className="text-2xl font-serif font-bold text-white">£{totalWinnings.toFixed(2)}</span>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-text-muted">Total Winning Draws</span>
          <div className="text-2xl font-serif font-bold text-white">{winnings.length}</div>
          <span className="text-[11px] text-text-secondary font-mono">Verified in platform</span>
        </Card>
        <Card variant="default" className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-text-muted">Verification Status</span>
          <div className="text-2xl font-serif font-bold text-green-400 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" /> All Verified
          </div>
          <span className="text-[11px] text-text-secondary font-mono">Signed off by admin audit</span>
        </Card>
        <Card variant="default" className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-text-muted">Payout Status</span>
          <div className="text-2xl font-serif font-bold text-blue-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> Paid
          </div>
          <span className="text-[11px] text-text-secondary font-mono">Bank transfer recorded</span>
        </Card>
      </div>

      {/* Winnings Table */}
      <Card variant="gradient" className="space-y-4">
        <h2 className="text-lg font-serif font-medium text-white border-b border-border-subtle pb-3">
          Historical Prize Records
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted uppercase tracking-wider">
                <th className="text-left py-3">Draw</th>
                <th className="text-left py-3">Tier</th>
                <th className="text-right py-3">Prize Amount</th>
                <th className="text-center py-3">Verification</th>
                <th className="text-right py-3">Payout</th>
              </tr>
            </thead>
            <tbody>
              {winnings.map((item) => (
                <tr key={item.id} className="border-b border-border-subtle/50">
                  <td className="py-4 text-white">
                    Draw #{item.draw_number} ({new Date(item.draw_month).toLocaleDateString("en-GB", { month: "short", year: "numeric" })})
                  </td>
                  <td className="py-4">
                    <Badge variant="charcoal" className="text-[10px]">
                      {item.match_tier.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 text-right font-bold text-white">
                    £{item.prize_amount.toFixed(2)}
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-green-400 font-bold uppercase text-[10px] inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Approved
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-blue-400 font-bold uppercase text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
