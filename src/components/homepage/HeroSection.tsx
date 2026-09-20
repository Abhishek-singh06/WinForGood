"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { ArrowUpRight, ShieldCheck, Heart, Sparkles, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-border-subtle bg-bg-deep">
      {/* Subtle architectural grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#151B23_1px,transparent_1px),linear-gradient(to_bottom,#151B23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <Container size="wide" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Mission Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="red" className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Monthly Prize Draw Active
              </Badge>
              <span className="text-xs font-mono text-text-secondary">
                PRD Edition 2026 · Level 1 Verified
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white leading-[1.08]">
              Where Golf Performance Drives{" "}
              <span className="italic text-text-silver underline decoration-red-500/60 decoration-2 underline-offset-8">
                Human Impact.
              </span>
            </h1>

            {/* Concise Supporting Copy */}
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
              Enter your latest five Stableford scores, direct at least 10% of your membership
              to causes that change lives, and unlock monthly draws with rolling jackpots.
              No fairways. No clichés. Just verified score performance and authentic giving.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider">
                  Subscribe & Play <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/charities">
                <Button variant="silver" size="lg" className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider">
                  Explore Causes
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-border-subtle grid grid-cols-3 gap-4 text-xs font-mono text-text-secondary">
              <div className="space-y-1">
                <span className="text-white block font-bold">1–45 RANGE</span>
                <span className="text-text-muted text-[11px]">Stableford Scoring</span>
              </div>
              <div className="space-y-1">
                <span className="text-white block font-bold">MIN 10%</span>
                <span className="text-text-muted text-[11px]">To Your Charity</span>
              </div>
              <div className="space-y-1">
                <span className="text-white block font-bold">40% JACKPOT</span>
                <span className="text-text-muted text-[11px]">5-Match Rollover</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Anticipation & Live Metric Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="charcoal-card-gradient border border-border-silver/40 rounded-lg p-7 shadow-panel space-y-6 relative overflow-hidden">
              {/* Subtle top silver accent line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-blue-500" />

              {/* Live Jackpot Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest block">
                    Current Estimated Jackpot
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                      $24,850
                    </span>
                    <Badge variant="red" className="text-[10px]">
                      Rollover Active
                    </Badge>
                  </div>
                </div>
                <div className="w-10 h-10 rounded bg-surface-graphite border border-border-subtle flex items-center justify-center text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Sample Rolling Scorecard Strip */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span>Your Latest 5 Scores</span>
                  <span className="text-text-muted">Rolling FIFO</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[38, 41, 36, 39, 42].map((score, i) => (
                    <div
                      key={i}
                      className="bg-surface-graphite border border-border-subtle rounded p-2.5 text-center space-y-1"
                    >
                      <span className="text-[10px] font-mono text-text-muted block">R{i + 1}</span>
                      <span className="text-lg font-mono font-bold text-white">{score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Tier Distribution Box */}
              <div className="bg-bg-deep/60 rounded border border-border-subtle p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>5-Number Match (Jackpot)</span>
                  <span className="text-white font-bold">40% Share · Rollover</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>4-Number Match</span>
                  <span className="text-white">35% Share</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>3-Number Match</span>
                  <span className="text-white">25% Share</span>
                </div>
              </div>

              {/* Impact Guarantee */}
              <div className="flex items-center gap-3 pt-2 text-xs text-text-secondary">
                <Heart className="w-4 h-4 text-red-500 shrink-0" />
                <span>Every membership directs funds to vetted community causes monthly.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
