import React from "react";
import Link from "next/link";
import { getCurrentUserAndProfile, signOutAction } from "@/lib/auth/actions";
import { resolveSubscriptionAccess } from "@/lib/subscriptions/resolver";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  LayoutDashboard,
  ListOrdered,
  Heart,
  Sparkles,
  Trophy,
  User,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await getCurrentUserAndProfile();

  if (!authData?.user) {
    redirect("/login");
  }

  const { profile, user } = authData;

  // Resolve real subscription access state for sidebar display
  const accessState = user?.id
    ? await resolveSubscriptionAccess(user.id)
    : { hasAccess: false, subscription: null, statusLabel: "No Subscription", inGracePeriod: false };


  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/scores", label: "Golf Scores", icon: ListOrdered },
    { href: "/dashboard/charity", label: "My Cause", icon: Heart },
    { href: "/dashboard/draws", label: "Monthly Draws", icon: Sparkles },
    { href: "/dashboard/winnings", label: "Winnings & Proofs", icon: Trophy },
    { href: "/dashboard/account", label: "Account Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-near/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-sm bg-surface-charcoal border border-border-silver flex items-center justify-center text-white">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-mono text-xs tracking-wider text-white uppercase font-bold">
              DIGITAL<span className="text-red-500">.</span>HEROES
            </span>
          </Link>
          <span className="text-xs font-mono text-text-muted hidden sm:inline">|</span>
          <Badge variant="blue" className="hidden sm:inline-flex text-[10px]">
            Subscriber Portal
          </Badge>
        </div>

        {/* User Status & Sign Out */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-medium text-white block">
              {profile?.full_name || "Subscriber Member"}
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
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border-subtle bg-bg-near p-4 sm:p-6 space-y-6 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted px-3">
              Application Modules
            </span>
            <nav className="space-y-1 pt-1">
              {navItems.map((item) => {
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


          {/* Real Subscription Status Banner */}
          <div className={`p-3.5 rounded border space-y-2 text-xs ${
            accessState.hasAccess
              ? accessState.inGracePeriod
                ? "bg-surface-charcoal border-red-800"
                : "bg-surface-charcoal border-border-subtle"
              : "bg-surface-charcoal border-red-900"
          }`}>
            <div className={`flex items-center gap-2 font-mono text-[11px] ${
              accessState.hasAccess
                ? accessState.inGracePeriod
                  ? "text-red-400"
                  : "text-blue-400"
                : "text-red-400"
            }`}>
              {accessState.hasAccess ? (
                accessState.inGracePeriod ? (
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                )
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="font-bold uppercase">Subscription</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
              {accessState.statusLabel}
              {accessState.inGracePeriod && accessState.subscription?.current_period_end && (
                <span className="block text-red-400 mt-0.5">
                  Access until{" "}
                  {new Date(accessState.subscription.current_period_end).toLocaleDateString(
                    "en-GB", { month: "short", day: "numeric", year: "numeric" }
                  )}
                </span>
              )}
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-10 overflow-x-hidden">
          <Container size="wide" className="p-0">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
