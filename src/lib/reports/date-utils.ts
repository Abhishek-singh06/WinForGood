/**
 * =============================================================================
 * DIGITAL HEROES — Phase 7: Date Range Utility & Boundaries
 * Timezone Mandate: Strictly UTC date boundaries for reporting queries
 * =============================================================================
 */

import type { DateRangeFilter, DateBounds } from "./types";

/**
 * Calculates start and end timestamps in UTC for a specified date range filter.
 * Ensures consistent filtering across database queries and tests.
 */
export function getDateRangeBounds(
  filter: DateRangeFilter,
  referenceDate: Date = new Date()
): DateBounds {
  const now = new Date(referenceDate);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-indexed

  switch (filter) {
    case "current_month": {
      const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      // First day of next month at 00:00:00 UTC
      const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Current Month",
        timezone: "UTC",
      };
    }

    case "previous_month": {
      const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Previous Month",
        timezone: "UTC",
      };
    }

    case "last_3_months": {
      const start = new Date(Date.UTC(year, month - 2, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 3 Months",
        timezone: "UTC",
      };
    }

    case "last_6_months": {
      const start = new Date(Date.UTC(year, month - 5, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 6 Months",
        timezone: "UTC",
      };
    }

    case "last_12_months": {
      const start = new Date(Date.UTC(year, month - 11, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 12 Months",
        timezone: "UTC",
      };
    }

    case "all_time":
    default: {
      return {
        startDate: null,
        endDate: null,
        label: "All Time",
        timezone: "UTC",
      };
    }
  }
}

/**
 * Checks if a given ISO date string falls within the specified bounds.
 */
export function isDateWithinBounds(
  dateIso: string | null | undefined,
  bounds: DateBounds
): boolean {
  if (!dateIso) return false;
  const time = new Date(dateIso).getTime();
  if (isNaN(time)) return false;

  if (bounds.startDate && time < new Date(bounds.startDate).getTime()) {
    return false;
  }
  if (bounds.endDate && time >= new Date(bounds.endDate).getTime()) {
    return false;
  }
  return true;
}
