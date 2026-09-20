/**
 * =============================================================================
 * DIGITAL HEROES — Phase 7: Admin Reporting & Analytics Types
 * PRD Reference: § 11.05 (Reports & Analytics)
 * =============================================================================
 */

export type DateRangeFilter =
  | "current_month"
  | "previous_month"
  | "last_3_months"
  | "last_6_months"
  | "last_12_months"
  | "all_time";

export interface DateBounds {
  startDate: string | null; // ISO string in UTC or null for unbounded
  endDate: string | null;   // ISO string in UTC or null for unbounded
  label: string;
  timezone: "UTC";
}

export interface SubscriberGrowthItem {
  month: string;              // 'YYYY-MM'
  newRegistrations: number;   // New accounts registered in this calendar month
  cumulativeSubscribers: number; // Running total of accounts up to this month
}

export interface SubscriberGrowthReport {
  currentTotal: number;       // Current total registered subscribers
  currentActive: number;      // Current subscribers with status = 'active'
  currentInactive: number;    // Current subscribers with canceled/past_due/unpaid status
  monthlyTrend: SubscriberGrowthItem[];
  hasHistoricalData: boolean;
}

export interface DrawHistoryReportItem {
  id: string;
  drawNumber: number;
  month: string;              // 'YYYY-MM-01'
  mode: "random" | "algorithmic";
  publicationStatus: "draft" | "simulated" | "published" | "archived";
  participantCount: number;
  winningNumbers: number[];
  tier5AllocationPence: number;
  tier4AllocationPence: number;
  tier3AllocationPence: number;
  tier5WinnerCount: number;
  tier4WinnerCount: number;
  tier3WinnerCount: number;
  jackpotRolloverInPence: number;
  jackpotRolloverOutPence: number;
  unclaimedLowerTierPence: number;
  totalPrizePence: number;
  publishedAt: string | null;
}

export interface CharityReportItem {
  charityId: string;
  name: string;
  slug: string;
  category: string;
  associatedSubscribers: number;
  avgContributionPercentage: number;
  subscriptionCharityPence: number;   // From active subscription contributions (10% floor)
  unclaimedPrizeDisbursedPence: number; // From unclaimed 3/4-match prize funds (TA-006)
  totalCharityPence: number;          // Subscription + Unclaimed Dispositions
}

export interface FinancialSummaryReport {
  subscriptionRevenueBasisPence: number;
  prizePoolContributionPence: number;   // 30% MER basis
  grossPrizePoolPence: number;          // Sum of pools for draws in period
  tier5AllocationPence: number;         // 40% of pool
  tier4AllocationPence: number;         // 35% of pool
  tier3AllocationPence: number;         // 25% of pool
  jackpotRolloverInPence: number;
  jackpotRolloverOutPence: number;
  unclaimedLowerTierPence: number;
  pendingWinningsPence: number;         // Unpaid winner entries
  paidWinningsPence: number;            // Paid winner entries
  totalWinningsPence: number;
  subscriptionCharityPence: number;     // Direct charity percentage from subscriptions
  unclaimedCharityPence: number;        // Unclaimed lower-tier funds routed to charity
  totalCharityPence: number;
  currency: "GBP";
  isTemporaryAssumption: boolean;
}

export interface ReportSummaryCards {
  totalSubscribers: number;
  activeSubscribers: number;
  totalPrizePoolPence: number;
  paidWinningsPence: number;
  totalCharityPence: number;
}

export interface AdminReportsData {
  range: DateRangeFilter;
  bounds: DateBounds;
  summaryCards: ReportSummaryCards;
  subscriberGrowth: SubscriberGrowthReport;
  drawHistory: DrawHistoryReportItem[];
  charities: CharityReportItem[];
  financials: FinancialSummaryReport;
  generatedAt: string;
}

export interface ReportsActionResponse {
  success: boolean;
  data?: AdminReportsData;
  error?: string;
}
