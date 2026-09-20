import React from "react";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { resolveSubscriptionAccess, getPricingConfig } from "@/lib/subscriptions/resolver";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SubscriptionManager } from "@/components/subscriptions/SubscriptionManager";
import { User, Mail, Shield, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage() {
  const authData = await getCurrentUserAndProfile();
  const profile = authData?.profile;
  const user = authData?.user;

  // Resolve subscription access state server-side
  const accessState = user?.id
    ? await resolveSubscriptionAccess(user.id)
    : {
        hasAccess: false,
        subscription: null,
        statusLabel: "Not authenticated",
        inGracePeriod: false,
      };

  const pricingConfig = getPricingConfig();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">Account Settings</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Subscriber Profile
          </h1>
          <p className="text-xs text-text-secondary">
            Manage your personal identity, verified account metadata, and subscription.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Identity card */}
        <Card variant="gradient" className="space-y-6">
          <h2 className="text-lg font-serif font-medium text-white border-b border-border-subtle pb-3">
            Identity &amp; Credentials
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" /> Full Name
              </span>
              <span className="text-sm font-sans font-medium text-white block">
                {profile?.full_name || "Subscriber Member"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> Account Email
              </span>
              <span className="text-sm font-sans text-text-silver block">
                {user?.email}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> System Role
              </span>
              <Badge variant="charcoal">{profile?.role || "subscriber"}</Badge>
            </div>

            <div className="space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Member Since
              </span>
              <span className="text-sm font-sans text-text-silver block">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </Card>

        {/* Security rules card */}
        <Card variant="default" className="space-y-4">
          <h2 className="text-lg font-serif font-medium text-white border-b border-border-subtle pb-3">
            Security &amp; Session Rules
          </h2>
          <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
            <li>• Password credentials encrypted via Supabase Auth.</li>
            <li>• HttpOnly secure cookie session handling with automatic SSR token refresh.</li>
            <li>• Client-side role elevation strictly prohibited by database RLS and triggers.</li>
          </ul>
        </Card>
      </div>

      {/* Subscription Management */}
      <SubscriptionManager
        accessState={accessState}
        stripeConfigured={pricingConfig.stripeConfigured}
      />
    </div>
  );
}
