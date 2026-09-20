"use server";

/**
 * =============================================================================
 * DIGITAL HEROES — Phase 7: Admin Reporting Server Actions
 * PRD Reference: § 11.05 (Reports & Analytics)
 * Security Mandate: Strictly Admin-Only Server-Side Authorization Barrier
 * =============================================================================
 */

import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { generateAdminReportsData } from "./service";
import type { DateRangeFilter, ReportsActionResponse } from "./types";

/**
 * Fetches comprehensive admin operational and financial reporting analytics.
 * Accessible strictly by authenticated administrators.
 */
export async function getAdminReportsAction(
  filter: DateRangeFilter = "all_time"
): Promise<ReportsActionResponse> {
  const auth = await getCurrentUserAndProfile();

  // Strict server-side admin role authorization barrier
  if (!auth || auth.profile?.role !== "admin") {
    return {
      success: false,
      error: "Access denied. Administrator privileges are required to view reports.",
    };
  }

  try {
    const data = await generateAdminReportsData(filter);
    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate reports";
    return {
      success: false,
      error: msg,
    };
  }
}
