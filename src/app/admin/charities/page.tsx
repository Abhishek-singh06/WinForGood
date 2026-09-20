import React from "react";
import { getCharities } from "@/lib/charities/actions";
import { AdminCharityManager } from "@/components/admin/AdminCharityManager";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminCharitiesPage() {
  // Pass activeOnly: false so admins can manage both active and inactive causes
  const charities = await getCharities({ activeOnly: false });

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <Badge variant="red">Control Surface 03</Badge>
        <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
          Charity Governance & Directory Management
        </h1>
        <p className="text-xs text-text-secondary">
          PRD § 08 & § 11.03: Create, edit, activate/deactivate partner causes, and manage featured status.
        </p>
      </div>

      <AdminCharityManager initialCharities={charities} />
    </div>
  );
}
