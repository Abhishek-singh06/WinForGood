import React from "react";
import { Badge } from "@/components/ui/Badge";
import { getAdminDraws } from "@/lib/draws/actions";
import { AdminDrawManager } from "@/components/admin/AdminDrawManager";

export const dynamic = "force-dynamic";

export default async function AdminDrawsPage() {
  const draws = await getAdminDraws();

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <Badge variant="red">Control Surface 02</Badge>
        <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
          Draw Management
        </h1>
        <p className="text-xs text-text-secondary">
          PRD § 06 &amp; § 11.02: Configure draw cadence and logic, stage simulations, and commit immutable published results.
        </p>
      </div>

      <AdminDrawManager initialDraws={draws} />
    </div>
  );
}
