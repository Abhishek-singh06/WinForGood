"use client";

/**
 * Demo Dashboard Layout
 *
 * Mirrors the production dashboard layout but uses only demo data.
 * No Supabase calls, no server actions, no real authentication.
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { DemoProvider, useDemoContext } from "@/lib/demo/context";
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
  CheckCircle2,
  CreditCard,
} from "lucide-react";

function DemoLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useDemoContext();
  const pathname = usePathname();

  const navItems = [
    { href: "/demo", label: "Overview", icon: LayoutDashboard },
    { href: "/demo/scores", label: "Golf Scores", icon: ListOrdered },
    { href: "/demo/charity", label: "My Cause", icon: Heart },
    { href: "/demo/draws", label: "Monthly Draws", icon: Sparkles },
    { href: "/demo/winnings", label: "Winnings & Proofs", icon: Trophy },
    { href: "/demo/account", label: "Account Profile", icon: User },
    { href: "/demo/payment", label: "Demo Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col">
      {/* Demo Banner */}
      <DemoBanner />

      {/* Top Application Bar */}
      <header className="sticky top-[33px] z-30 border-b border-border-subtle bg-bg-near/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/demo" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-sm bg-surface-charcoal border border-border-silver flex items-center justify-center text-white">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-mono text-xs tracking-wider text-white uppercase font-bold">
              DIGITAL<span className="text-red-500">.</span>HEROES
            </span>
          </Link>
          <span className="text-xs font-mono text-text-muted hidden sm:inline">|</span>
          <Badge variant="blue" className="hidden sm:inline-flex text-[10px]">
            Demo Portal
          </Badge>
        </div>

        {/* User Status & Exit Demo */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-medium text-white block">
              {user.full_name}
            </span>
            <span className="text-[11px] font-mono text-text-muted block">
              {user.email}
            </span>
          </div>

          <Link href="/login">
            <Button
              variant="silver"
              size="sm"
              className="font-mono text-xs gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-text-muted" />
              <span className="hidden sm:inline">Exit Demo</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border-subtle bg-bg-near p-4 sm:p-6 space-y-6 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted px-3">
              Demo Modules
            </span>
            <nav className="space-y-1 pt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-colors ${
                      isActive
                        ? "text-white bg-surface-charcoal border border-border-silver"
                        : "text-text-secondary hover:text-white hover:bg-surface-charcoal border border-transparent hover:border-border-subtle"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-text-silver"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Demo Subscription Status */}
          <div className="p-3.5 rounded border bg-surface-charcoal border-border-subtle space-y-2 text-xs">
            <div className="flex items-center gap-2 font-mono text-[11px] text-blue-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold uppercase">Demo Subscription</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
              Active Monthly — Sample data only
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

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <DemoLayoutInner>{children}</DemoLayoutInner>
    </DemoProvider>
  );
}
