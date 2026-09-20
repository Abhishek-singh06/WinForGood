"use client";

import React from "react";
import { useDemoContext } from "@/lib/demo/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DemoScoresPage() {
  const { scores } = useDemoContext();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">Stableford Pool</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Golf Performance Scores
          </h1>
          <p className="text-xs text-text-secondary">
            Demo scores — submit official 18-hole Stableford scores (1–45 pts). Rolling 5-score record.
          </p>
        </div>
      </div>

      {/* Score Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {scores.map((score, idx) => (
          <Card
            key={score.id}
            variant={idx === scores.length - 1 ? "outline" : "gradient"}
            className="text-center space-y-2 relative"
          >
            {idx === scores.length - 1 && (
              <Badge variant="silver" className="absolute top-2 right-2 text-[9px]">
                Oldest
              </Badge>
            )}
            <span className="text-[10px] font-mono text-text-muted uppercase block">
              Round {idx + 1}
            </span>
            <div className="text-3xl font-mono font-bold text-white">
              {score.score}
            </div>
            <span className="text-[11px] font-mono text-text-secondary block">
              {new Date(score.score_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </Card>
        ))}
      </div>

      {/* Score Entry Simulation */}
      <Card variant="gradient" className="space-y-4">
        <h2 className="text-lg font-serif font-medium text-white">
          Submit New Score
        </h2>
        <p className="text-xs text-text-secondary">
          In the live platform, you would enter a new Stableford score (1–45) here.
          The oldest score is replaced when you reach 5 scores.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-text-muted tracking-wider">
              Score (1–45)
            </label>
            <div className="h-11 rounded-sm bg-surface-charcoal border border-border-subtle flex items-center px-3 text-sm text-text-muted font-mono">
              36 (Demo — read only)
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-text-muted tracking-wider">
              Date Played
            </label>
            <div className="h-11 rounded-sm bg-surface-charcoal border border-border-subtle flex items-center px-3 text-sm text-text-muted font-mono">
              21 Sep 2026 (Demo)
            </div>
          </div>
        </div>
        <div className="p-3 rounded bg-blue-950/20 border border-blue-500/20 text-xs text-blue-300 font-mono">
          Demo mode — score entry is simulated. No data is saved.
        </div>
      </Card>

      {/* Score History */}
      <Card variant="default" className="space-y-4">
        <h2 className="text-lg font-serif font-medium text-white border-b border-border-subtle pb-3">
          Score History (Demo)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-2 text-text-muted uppercase tracking-wider">Date</th>
                <th className="text-center py-2 text-text-muted uppercase tracking-wider">Score</th>
                <th className="text-right py-2 text-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <tr key={score.id} className="border-b border-border-subtle/50">
                  <td className="py-3 text-text-silver">
                    {new Date(score.score_date).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </td>
                  <td className="py-3 text-center text-white font-bold">{score.score}</td>
                  <td className="py-3 text-right">
                    <Badge variant="blue" className="text-[10px]">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
