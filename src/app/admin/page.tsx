import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Users,
  CreditCard,
  Sparkles,
  Heart,
  Trophy,
  BarChart3,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminOverviewPage() {
  const controlSurfaces = [
    {
      title: "01. User Management",
      href: "/admin/users",
      icon: Users,
      badge: "PRD § 11.01",
      desc: "Inspect subscriber accounts, review roles, track charity preferences, and check score activity.",
      actionLabel: "Manage Users",
    },
    {
      title: "01.3 Subscription Operations",
      href: "/admin/subscriptions",
      icon: CreditCard,
      badge: "PRD § 04 / § 11",
      desc: "Monitor active subscribers, past-due grace period accounts, cancellation requests, and Stripe linkage.",
      actionLabel: "View Subscriptions",
    },
    {
      title: "02. Draw Management",
      href: "/admin/draws",
      icon: Sparkles,
      badge: "PRD § 06 / § 11.02",
      desc: "Configure draw modes (Random vs Algorithmic), run test simulations, and commit immutable published results.",
      actionLabel: "Control Draws",
    },
    {
      title: "03. Charity Governance",
      href: "/admin/charities",
      icon: Heart,
      badge: "PRD § 08 / § 11.03",
      desc: "Add and edit vetted causes, toggle active status, and maintain beneficiary compliance.",
      actionLabel: "Manage Causes",
    },
    {
      title: "04. Winner Verification",
      href: "/admin/winners",
      icon: Trophy,
      badge: "PRD § 09 / § 11.04",
      desc: "Review submitted scorecard evidence, approve or reject with reasons, and progress verified payouts.",
      actionLabel: "Verify Winners",
    },
    {
      title: "05. Reports & Analytics",
      href: "/admin/reports",
      icon: BarChart3,
      badge: "PRD § 11.05",
      desc: "Real-time subscriber growth, draw cycle history, charity ledgers, and financial summary statements.",
      actionLabel: "View Reports",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="red">Administrative Authority</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Operations Command Center
          </h1>
          <p className="text-xs text-text-secondary">
            PRD § 11: Five integrated control surfaces managing platform operations from subscriber onboarding through verified payouts.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-green-400 bg-surface-charcoal border border-border-subtle px-3 py-1.5 rounded">
          <ShieldCheck className="w-4 h-4" />
          <span>All Control Surfaces Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {controlSurfaces.map((surface) => {
          const Icon = surface.icon;
          return (
            <Card key={surface.title} variant="gradient" className="flex flex-col justify-between space-y-4 border-border-subtle">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded bg-surface-graphite border border-border-silver/40 flex items-center justify-center text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant="charcoal" className="text-[10px]">{surface.badge}</Badge>
                </div>
                <h2 className="text-base font-serif font-medium text-white">{surface.title}</h2>
                <p className="text-xs text-text-secondary leading-relaxed">{surface.desc}</p>
              </div>

              <div className="pt-2 border-t border-border-subtle/50">
                <Link href={surface.href}>
                  <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase flex items-center justify-center gap-1">
                    <span>{surface.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
