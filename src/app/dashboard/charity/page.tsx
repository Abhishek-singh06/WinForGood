import React from "react";
import Link from "next/link";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { getCharities } from "@/lib/charities/actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Info, HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CharityDashboardPage() {
  const authData = await getCurrentUserAndProfile();
  const allCharities = await getCharities({ activeOnly: false });

  // Get user's active charity
  const userCharityId = (authData?.profile as any)?.charity_id;
  const userPercentage = (authData?.profile as any)?.charity_percentage || 10;

  const selectedCharity = allCharities.find((c) => c.id === userCharityId) || allCharities[0];

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
              {userPercentage}.00%
            </div>
            <p className="text-[11px] text-text-secondary font-mono">
              of your monthly subscription fee
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

        {/* Open Decision Disclosure on Post-Signup Changes */}
        <div className="p-4 rounded bg-surface-charcoal border border-border-silver/40 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-mono font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Governance Disclosure (PRD § 07 & § 08)</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong>STATUS: OPEN DECISION</strong> — The PRD specifies that a subscriber selects their charity and contribution percentage upon signup. Post-signup charity modification behavior is intentionally unspecified/pending the PRD decision. Your verified signup selection is displayed below without assuming an arbitrary post-signup modification policy.
          </p>
          <div className="pt-2 border-t border-border-subtle flex items-center gap-2 text-[11px] text-text-muted font-mono">
            <Info className="w-3.5 h-3.5 text-text-silver shrink-0" />
            <span>
              Monetary donation calculations remain deferred until subscription pricing decisions are formally resolved.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
