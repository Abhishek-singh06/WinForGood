import React from "react";
import { Badge } from "@/components/ui/Badge";
import { getAdminWinnersList } from "@/lib/winners/actions";
import { AdminWinnerVerificationManager } from "@/components/admin/AdminWinnerVerificationManager";

export const dynamic = "force-dynamic";

export default async function AdminWinnersPage() {
  const winners = await getAdminWinnersList();

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <Badge variant="red">Control Surface 04</Badge>
        <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
          Winner Verification &amp; Payouts
        </h1>
        <p className="text-xs text-text-secondary">
          PRD § 09 &amp; § 11.04: Review submitted scorecard screenshots, approve or reject evidence with reasons, and progress verified payouts.
        </p>
      </div>

      <AdminWinnerVerificationManager initialWinners={winners} />
    </div>
  );
}
