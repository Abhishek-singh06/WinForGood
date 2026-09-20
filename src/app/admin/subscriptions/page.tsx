import React from "react";
import { Badge } from "@/components/ui/Badge";
import { getAdminSubscriptionsList } from "@/lib/subscriptions/admin-subscriptions";
import { AdminSubscriptionsManager } from "@/components/admin/AdminSubscriptionsManager";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await getAdminSubscriptionsList();

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <Badge variant="red">Control Surface 01.3</Badge>
        <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
          Subscription Operations &amp; Billing
        </h1>
        <p className="text-xs text-text-secondary">
          PRD § 04 &amp; § 11: Monitor active paying subscribers, past-due grace period accounts, cancellation requests, and Stripe customer linkages.
        </p>
      </div>

      <AdminSubscriptionsManager initialSubscriptions={subscriptions} />
    </div>
  );
}
