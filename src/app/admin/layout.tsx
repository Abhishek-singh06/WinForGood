import React from "react";
import Link from "next/link";
import { getCurrentUserAndProfile, signOutAction } from "@/lib/auth/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShieldAlert,
  Users,
  CreditCard,
  Sparkles,
  Heart,
  Trophy,
  BarChart3,
  LogOut,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await getCurrentUserAndProfile();

  if (!authData?.user) {
    redirect("/login?next=/admin");
  }

  const { profile, user } = authData;

  // Server-Side Authorization Enforcement (BR-140 & BR-141)
  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-lg bg-surface-charcoal border border-red-500/40 shadow-panel text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="red">403 Forbidden</Badge>
            <h1 className="text-2xl font-serif font-medium text-white">
              Access Denied
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              Administrative credentials are required to access this surface (PRD § 03 / BR-141).
              Your authenticated account is verified as{" "}
              <strong className="text-white uppercase font-mono">{profile?.role || "subscriber"}</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded bg-bg-deep border border-border-subtle text-[11px] font-mono text-text-muted text-left">
            Authenticated User: {user.email} <br />
            Enforcement: Server-Side RBAC
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="silver" size="sm">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Subscriber Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminNavItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/admin/draws", label: "Draw Control", icon: Sparkles },
    { href: "/admin/charities", label: "Charity Management", icon: Heart },
    { href: "/admin/winners", label: "Winner Verification", icon: Trophy },
    { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b border-border-silver/40 bg-bg-near/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-sm bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-mono text-xs tracking-wider text-white uppercase font-bold">
              DIGITAL<span className="text-red-500">.</span>HEROES
            </span>
          </Link>
          <span className="text-xs font-mono text-text-muted hidden sm:inline">|</span>
          <Badge variant="red" className="hidden sm:inline-flex text-[10px]">
            Administrative Operations
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-medium text-white block">
              {profile?.full_name} (Admin)
            </span>
            <span className="text-[11px] font-mono text-text-muted block">
              {user.email}
            </span>
          </div>

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="silver"
              size="sm"
              className="font-mono text-xs gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-text-muted" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </form>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border-subtle bg-bg-near p-4 sm:p-6 space-y-6 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted px-3">
              5 Control Surfaces (§ 11)
            </span>
            <nav className="space-y-1 pt-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-mono uppercase tracking-wider text-text-secondary hover:text-white hover:bg-surface-charcoal border border-transparent hover:border-border-subtle transition-colors"
                  >
                    <Icon className="w-4 h-4 text-text-silver" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-3.5 rounded bg-surface-charcoal border border-border-subtle space-y-1 text-xs">
            <span className="font-mono text-white text-[11px] font-bold block uppercase">
              Operational Gate
            </span>
            <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
              All 5 administrative control surfaces are operational: User directory, Subscriptions, Draw engine, Cause governance, Winner payouts, and Executive reporting.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-10 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
