import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, ShieldCheck, HeartHandshake } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-24 bg-bg-near relative overflow-hidden">
      {/* Visual metallic sheen overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-charcoal/40 to-bg-deep pointer-events-none" />

      <Container size="wide" className="relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-10 sm:p-16 rounded-lg bg-surface-charcoal border border-border-silver shadow-panel relative">
          {/* Subtle accent highlight on top */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
              Join Digital Heroes · Season 2026
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium text-white tracking-tight leading-tight">
              Turn Your Five Latest Rounds Into <br className="hidden sm:inline" />
              <span className="italic text-text-silver">Lasting Community Change.</span>
            </h2>
            <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
              Transparent monthly prize draws, verified scorecard winners, and at least 10% of every
              membership directly funding vetted nonprofit initiatives.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider">
                Subscribe & Play <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button variant="silver" size="lg" className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider">
                View Membership Plans
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-border-subtle flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-red-500" /> 10% Minimum Charity Floor
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
