import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Shield, Heart, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-near py-16 text-text-secondary">
      <Container size="wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Platform Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm bg-surface-charcoal border border-border-silver flex items-center justify-center text-white">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="font-mono text-sm tracking-wider text-white uppercase font-bold">
                DIGITAL<span className="text-red-500">.</span>HEROES
              </span>
            </div>
            <p className="text-sm text-text-secondary max-w-md leading-relaxed">
              A modern subscription platform connecting golf performance with charitable impact and
              monthly prize pools. Built to champion causes that matter, with full transparency.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-text-muted pt-2">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500" /> Min. 10% to Charity
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-400" /> Verified Winner Payouts
              </span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-xs font-mono uppercase">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/charities" className="hover:text-white transition-colors">
                  Partner Charities
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Join the Draw
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white">
              Governance & Truth
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <span className="text-text-muted block">Stableford Rules (1–45)</span>
              </li>
              <li>
                <span className="text-text-muted block">Rollover 5-Match Jackpot</span>
              </li>
              <li>
                <span className="text-text-muted block">PCI-Compliant Processing</span>
              </li>
              <li>
                <span className="text-text-muted block">Scorecard Verification Mandatory</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-muted">
          <p>© 2026 Digital Heroes. Issued for full-stack selection process. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Feel, not fairway.</span>
            <span>Version 1.0 (Level 1)</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
