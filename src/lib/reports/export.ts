/**
 * =============================================================================
 * DIGITAL HEROES — Phase 7: CSV Audit Export Utilities
 * PRD Reference: § 11.05 (Reports & Analytics Export)
 * =============================================================================
 */

import type { DrawHistoryReportItem, FinancialSummaryReport, DateBounds } from "./types";

function triggerDownload(csvContent: string, filename: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(cell: string | number | null | undefined): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports historical draw report to a formatted CSV file.
 */
export function exportDrawHistoryToCSV(draws: DrawHistoryReportItem[]) {
  const headers = [
    "Draw Number",
    "Draw Month",
    "Mode",
    "Publication Status",
    "Participants",
    "Winning Numbers",
    "Tier 5 Allocation (£)",
    "Tier 5 Winners",
    "Tier 4 Allocation (£)",
    "Tier 4 Winners",
    "Tier 3 Allocation (£)",
    "Tier 3 Winners",
    "Rollover In (£)",
    "Rollover Out (£)",
    "Unclaimed Lower Tier (£)",
    "Total Prize (£)",
    "Published At",
  ];

  const rows = draws.map((d) => [
    escapeCsvCell(d.drawNumber),
    escapeCsvCell(d.month),
    escapeCsvCell(d.mode),
    escapeCsvCell(d.publicationStatus),
    escapeCsvCell(d.participantCount),
    escapeCsvCell(d.winningNumbers.join("-")),
    escapeCsvCell((d.tier5AllocationPence / 100).toFixed(2)),
    escapeCsvCell(d.tier5WinnerCount),
    escapeCsvCell((d.tier4AllocationPence / 100).toFixed(2)),
    escapeCsvCell(d.tier4WinnerCount),
    escapeCsvCell((d.tier3AllocationPence / 100).toFixed(2)),
    escapeCsvCell(d.tier3WinnerCount),
    escapeCsvCell((d.jackpotRolloverInPence / 100).toFixed(2)),
    escapeCsvCell((d.jackpotRolloverOutPence / 100).toFixed(2)),
    escapeCsvCell((d.unclaimedLowerTierPence / 100).toFixed(2)),
    escapeCsvCell((d.totalPrizePence / 100).toFixed(2)),
    escapeCsvCell(d.publishedAt),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const filename = `digital-heroes-draw-history-${new Date().toISOString().substring(0, 10)}.csv`;
  triggerDownload(csvContent, filename);
}

/**
 * Exports platform financial summary to a formatted CSV file.
 */
export function exportFinancialSummaryToCSV(
  financials: FinancialSummaryReport,
  bounds: DateBounds
) {
  const headers = ["Financial Category", "Operational Basis / Formula", "Amount (GBP £)"];

  const rows = [
    ["Report Date Window", bounds.label, `${bounds.startDate || "Start"} to ${bounds.endDate || "Present"}`],
    ["Currency", "Configured Currency", financials.currency],
    ["Temporary Assumptions Applied", "TA-001 to TA-006", financials.isTemporaryAssumption ? "YES" : "NO"],
    ["---", "---", "---"],
    ["Subscription Revenue Basis", "Active subscribers × £10.00 MER", (financials.subscriptionRevenueBasisPence / 100).toFixed(2)],
    ["Prize Pool Contribution", "30% of subscription revenue", (financials.prizePoolContributionPence / 100).toFixed(2)],
    ["Gross Draw Prize Pool", "Allocated across published draws", (financials.grossPrizePoolPence / 100).toFixed(2)],
    ["Tier 5 Allocation (40%)", "Jackpot tier + incoming rollovers", (financials.tier5AllocationPence / 100).toFixed(2)],
    ["Tier 4 Allocation (35%)", "4-number matches", (financials.tier4AllocationPence / 100).toFixed(2)],
    ["Tier 3 Allocation (25%)", "3-number matches", (financials.tier3AllocationPence / 100).toFixed(2)],
    ["Jackpot Rollover In", "Carried forward from previous draw", (financials.jackpotRolloverInPence / 100).toFixed(2)],
    ["Jackpot Rollover Out", "Carried forward to next draw", (financials.jackpotRolloverOutPence / 100).toFixed(2)],
    ["Unclaimed Lower Tier", "Unwon 3/4 matches designated to charity", (financials.unclaimedLowerTierPence / 100).toFixed(2)],
    ["Paid Winnings", "Verified & marked Paid by admin", (financials.paidWinningsPence / 100).toFixed(2)],
    ["Pending Winnings", "Unverified or pending payout", (financials.pendingWinningsPence / 100).toFixed(2)],
    ["Total Winnings", "Paid + Pending winnings", (financials.totalWinningsPence / 100).toFixed(2)],
    ["Direct Subscription Charity", "Direct member % (>=10% floor)", (financials.subscriptionCharityPence / 100).toFixed(2)],
    ["Unclaimed Prize Charity", "Unclaimed 3/4 funds (TA-006)", (financials.unclaimedCharityPence / 100).toFixed(2)],
    ["Total Charity Allocation", "Subscription + Unclaimed charity total", (financials.totalCharityPence / 100).toFixed(2)],
  ].map((row) => row.map(escapeCsvCell).join(","));

  const csvContent = [headers.join(","), ...rows].join("\n");
  const filename = `digital-heroes-financial-summary-${new Date().toISOString().substring(0, 10)}.csv`;
  triggerDownload(csvContent, filename);
}
