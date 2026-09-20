import React from "react";
import { Badge } from "@/components/ui/Badge";
import { getAdminUsersList } from "@/lib/auth/admin-users";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsersList();

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <Badge variant="red">Control Surface 01</Badge>
        <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
          User Management
        </h1>
        <p className="text-xs text-text-secondary">
          PRD § 11.01: Inspect registered subscriber accounts, roles, charitable contribution percentages, and active subscription states.
        </p>
      </div>

      <AdminUsersManager initialUsers={users} />
    </div>
  );
}
