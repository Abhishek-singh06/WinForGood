"use client";

import React from "react";
import Link from "next/link";
import { useDemoContext } from "@/lib/demo/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Heart, Info, CheckCircle2 } from "lucide-react";

export default function DemoCharityPage() {
  const { selectedCharity, charityPercentage } = useDemoContext();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">Charity Preference</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            My Cause & Giving
          </h1>
          <p className="text-xs text-text-secondary">
            PRD § 07 & § 08: Every subscriber designates an approved partner charity to receive at least 10% of their subscription fee.
          </p>
        </div>

        <Link href="/charities">
          <Button variant="silver" size="sm" className="font-mono text-xs uppercase">
            Browse All Causes <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Selected Charity Card */}
      <Card variant="gradient" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
              Designated Beneficiary
            </span>
            <h2 className="text-2xl font-serif font-medium text-white">{selectedCharity.name}</h2>
            <p className="text-xs font-mono text-blue-400">{selectedCharity.category}</p>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed pt-1">
              {selectedCharity.mission}
            </p>
          </div>
          <Badge variant="blue" className="self-start">
            10% Platform Floor Verified
          </Badge>
        </div>

        {/* Allocation Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
          <div className="p-4 rounded bg-surface-charcoal border border-border-subtle space-y-1">
            <span className="text-[11px] font-mono uppercase text-text-muted">
              Designated Giving Allocation
            </span>
            <div className="text-2xl font-serif font-bold text-white">
              {charityPercentage}.00%
            </div>
            <p className="text-[11px] text-text-secondary font-mono">
              of your monthly subscription fee (£{(10 * (charityPercentage / 100)).toFixed(2)} / month)
            </p>
          </div>

          <div className="p-4 rounded bg-surface-charcoal border border-border-subtle space-y-1">
            <span className="text-[11px] font-mono uppercase text-text-muted">
              Beneficiary Status
            </span>
            <div className="text-2xl font-serif font-bold text-white flex items-center gap-2">
              <span className={selectedCharity.is_active ? "text-blue-400" : "text-text-muted"}>
                {selectedCharity.is_active ? "Active Partner" : "Archived"}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary font-mono">
              Approved recipient of member contributions
            </p>
          </div>
        </div>

        {/* Interactive Allocation Preview */}
        <div className="p-5 rounded bg-surface-charcoal border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-silver font-bold">
              Adjust Giving Allocation (Demo Preview)
            </span>
            <Badge variant="red">{charityPercentage}% Selected</Badge>
          </div>
          <p className="text-xs text-text-secondary">
            In live mode, subscribers select their contribution rate starting at the mandatory 10% floor up to 100%.
          </p>
          <div className="space-y-2">
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              defaultValue={charityPercentage}
              disabled
              className="w-full accent-blue-500 cursor-not-allowed opacity-75"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>10% (Floor)</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="p-4 rounded bg-blue-950/20 border border-blue-500/20 space-y-2">
          <div className="flex items-center gap-2 text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Demo Mode — Sample Charity Data</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            This screen illustrates designated beneficiary and contribution tracking. No actual funds are transferred or pledged in demo mode.
          </p>
        </div>
      </Card>
    </div>
  );
}
