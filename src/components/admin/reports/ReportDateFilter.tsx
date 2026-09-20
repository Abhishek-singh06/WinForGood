"use client";

import React from "react";
import type { DateRangeFilter, DateBounds } from "@/lib/reports/types";
import { Calendar, Clock } from "lucide-react";

interface ReportDateFilterProps {
  selectedFilter: DateRangeFilter;
  bounds: DateBounds;
  onFilterChange: (filter: DateRangeFilter) => void;
  disabled?: boolean;
}

const FILTER_OPTIONS: { id: DateRangeFilter; label: string }[] = [
  { id: "current_month", label: "Current Month" },
  { id: "previous_month", label: "Previous Month" },
  { id: "last_3_months", label: "Last 3 Months" },
  { id: "last_6_months", label: "Last 6 Months" },
  { id: "last_12_months", label: "Last 12 Months" },
  { id: "all_time", label: "All Time" },
];

export function ReportDateFilter({
  selectedFilter,
  bounds,
  onFilterChange,
  disabled = false,
}: ReportDateFilterProps) {
  function formatBoundsText(bounds: DateBounds): string {
    if (!bounds.startDate && !bounds.endDate) {
      return "All recorded history (unbounded)";
    }
    const startStr = bounds.startDate
      ? new Date(bounds.startDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
      : "Start";
    const endStr = bounds.endDate
      ? new Date(bounds.endDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
      : "Present";
    return `${startStr} — ${endStr} (UTC)`;
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded bg-surface-charcoal border border-border-subtle text-xs">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
        <Calendar className="w-4 h-4 text-text-muted shrink-0" />
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onFilterChange(opt.id)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded font-mono text-[11px] whitespace-nowrap transition-colors ${
              selectedFilter === opt.id
                ? "bg-accent-blue-subtle text-blue-300 font-bold border border-blue-600/60"
                : "bg-surface-graphite text-text-secondary hover:text-white border border-border-subtle"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-text-muted font-mono text-[11px] shrink-0">
        <Clock className="w-3.5 h-3.5" />
        <span>Range:</span>
        <span className="text-white font-medium">{formatBoundsText(bounds)}</span>
      </div>
    </div>
  );
}
