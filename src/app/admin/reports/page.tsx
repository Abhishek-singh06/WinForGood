import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { generateAdminReportsData } from "@/lib/reports/service";
import { AdminReportsManager } from "@/components/admin/reports/AdminReportsManager";
import { Badge } from "@/components/ui/Badge";
import { BarChart3, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Reports & Analytics | Digital Heroes Admin",
  description: "PRD § 11.05: Executive subscriber growth, draw history, charity contributions, and financial summaries.",
};

export default async function AdminReportsPage() {
  const auth = await getCurrentUserAndProfile();

  // Strict server-side authorization: Admins only
  if (!auth) {
    redirect("/login?returnUrl=/admin/reports");
  }

  if (auth.profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch initial reporting dataset (All Time default view)
  const initialData = await generateAdminReportsData("all_time");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="red" className="font-mono text-[10px]">
              Control Surface 05
            </Badge>
            <span className="text-xs font-mono text-text-muted flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Admin Authorized
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Reports &amp; Operational Analytics
          </h1>
          <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
            PRD § 11.05: Authoritative performance metrics for subscriber growth, monthly draw history, verified charity contributions, and platform financial summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Executive Ledger View</span>
        </div>
      </div>

      {/* Main Reporting Workspace */}
      <AdminReportsManager initialData={initialData} />
    </div>
  );
}
