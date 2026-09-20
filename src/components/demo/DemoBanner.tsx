"use client";

/**
 * Demo Mode Banner
 *
 * Persistent visual indicator that the user is in demo mode.
 * Clearly communicates that all data is fictional/sample data.
 */

import React from "react";
import { AlertTriangle } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      role="status"
      aria-label="Demo mode active"
      className="sticky top-0 z-50 bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-blue-950/90 border-b border-blue-500/30 backdrop-blur-md px-4 py-2 flex items-center justify-center gap-2 text-center"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
      <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">
        Demo Mode
      </span>
      <span className="text-[11px] text-blue-400/80 font-mono hidden sm:inline">
        — Sample data only · No real account
      </span>
    </div>
  );
}
