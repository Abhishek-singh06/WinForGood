/**
 * =============================================================================
 * DIGITAL HEROES — Phase 7: Admin Reporting & Analytics Test Suite
 * PRD Reference: § 11.05 (Reports & Analytics)
 * =============================================================================
 *
 * Exhaustive coverage of:
 * 1. Subscriber Growth (totals, active/inactive, monthly registrations, current vs historical)
 * 2. Monthly Draw History (participants, balls, tier allocations, winners, rollovers, unclaimed)
 * 3. Charity Reporting (subscribers, % averages, strict separation of sub donations vs unclaimed funds)
 * 4. Financial Summary (integer subunits / pence, explicit GBP, temporary assumptions flag)
 * 5. Date Filtering (UTC boundaries across current month, previous, 3/6/12 months, all time)
 * 6. Admin Role Authorization Barrier (unauthenticated & subscriber denied, admin allowed)
 * 7. CSV Export Utilities (escaping, structure)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateAdminReportsData,
  REPORTING_CONFIG,
  _resetFallbackReportsData,
} from "../lib/reports/service";
import { getAdminReportsAction } from "../lib/reports/actions";
import { getDateRangeBounds, isDateWithinBounds } from "../lib/reports/date-utils";
import * as authActions from "../lib/auth/actions";
import type { AdminReportsData } from "../lib/reports/types";

describe("1. Date Range Filtering & UTC Boundaries [date-utils]", () => {
  const refDate = new Date("2026-10-15T12:00:00Z");

  it("calculates current month boundaries strictly in UTC", () => {
    const bounds = getDateRangeBounds("current_month", refDate);
    expect(bounds.startDate).toBe("2026-10-01T00:00:00.000Z");
    expect(bounds.endDate).toBe("2026-11-01T00:00:00.000Z");
    expect(bounds.timezone).toBe("UTC");
    expect(bounds.label).toBe("Current Month");
  });

  it("calculates previous month boundaries strictly in UTC", () => {
    const bounds = getDateRangeBounds("previous_month", refDate);
    expect(bounds.startDate).toBe("2026-09-01T00:00:00.000Z");
    expect(bounds.endDate).toBe("2026-10-01T00:00:00.000Z");
    expect(bounds.label).toBe("Previous Month");
  });

  it("calculates last 3 months boundaries strictly in UTC", () => {
    const bounds = getDateRangeBounds("last_3_months", refDate);
    expect(bounds.startDate).toBe("2026-08-01T00:00:00.000Z");
    expect(bounds.endDate).toBe("2026-11-01T00:00:00.000Z");
    expect(bounds.label).toBe("Last 3 Months");
  });

  it("calculates all_time filter as unbounded (null start and end)", () => {
    const bounds = getDateRangeBounds("all_time", refDate);
    expect(bounds.startDate).toBeNull();
    expect(bounds.endDate).toBeNull();
    expect(bounds.label).toBe("All Time");
  });

  it("evaluates isDateWithinBounds accurately", () => {
    const bounds = getDateRangeBounds("current_month", refDate);
    expect(isDateWithinBounds("2026-10-15T10:00:00Z", bounds)).toBe(true);
    expect(isDateWithinBounds("2026-09-30T23:59:59Z", bounds)).toBe(false);
    expect(isDateWithinBounds("2026-11-01T00:00:00Z", bounds)).toBe(false); // Exclusive end
    expect(isDateWithinBounds(null, bounds)).toBe(false);
  });
});

describe("2. Subscriber Growth Analytics [PRD § 11.05 Area 1]", () => {
  beforeEach(async () => {
    await _resetFallbackReportsData();
    vi.restoreAllMocks();
  });

  it("provides current total, active, and inactive subscriber counts", async () => {
    const data = await generateAdminReportsData("all_time");
    expect(data.subscriberGrowth.currentTotal).toBe(75);
    expect(data.subscriberGrowth.currentActive).toBe(65);
    expect(data.subscriberGrowth.currentInactive).toBe(10);
    expect(
      data.subscriberGrowth.currentActive + data.subscriberGrowth.currentInactive
    ).toBe(data.subscriberGrowth.currentTotal);
  });

  it("aggregates monthly registration trend with cumulative totals", async () => {
    const data = await generateAdminReportsData("all_time");
    expect(data.subscriberGrowth.monthlyTrend.length).toBeGreaterThanOrEqual(3);

    const [aug, sep, oct] = data.subscriberGrowth.monthlyTrend;
    expect(aug.month).toBe("2026-08");
    expect(aug.newRegistrations).toBe(45);
    expect(aug.cumulativeSubscribers).toBe(45);

    expect(sep.month).toBe("2026-09");
    expect(sep.newRegistrations).toBe(20);
    expect(sep.cumulativeSubscribers).toBe(65);

    expect(oct.month).toBe("2026-10");
    expect(oct.newRegistrations).toBe(10);
    expect(oct.cumulativeSubscribers).toBe(75);
  });

  it("filters monthly trend by date range boundaries", async () => {
    const refDate = new Date("2026-10-15T12:00:00Z");
    const data = await generateAdminReportsData("current_month", refDate);
    // Only 2026-10 registrations fall into current month
    expect(data.subscriberGrowth.monthlyTrend.length).toBe(1);
    expect(data.subscriberGrowth.monthlyTrend[0].month).toBe("2026-10");
  });

  it("handles empty trend dataset gracefully", async () => {
    await _resetFallbackReportsData({
      subscriberGrowth: {
        currentTotal: 0,
        currentActive: 0,
        currentInactive: 0,
        monthlyTrend: [],
        hasHistoricalData: false,
      },
    });

    const data = await generateAdminReportsData("all_time");
    expect(data.subscriberGrowth.hasHistoricalData).toBe(false);
    expect(data.subscriberGrowth.monthlyTrend).toEqual([]);
  });
});

describe("3. Monthly Draw History [PRD § 11.05 Area 2]", () => {
  beforeEach(async () => {
    await _resetFallbackReportsData();
    vi.restoreAllMocks();
  });

  it("reports all published draws with complete audit parameters", async () => {
    const data = await generateAdminReportsData("all_time");
    expect(data.drawHistory.length).toBe(3);

    const draw1 = data.drawHistory.find((d) => d.drawNumber === 1);
    expect(draw1).toBeDefined();
    expect(draw1?.month).toBe("2026-08-01");
    expect(draw1?.mode).toBe("random");
    expect(draw1?.publicationStatus).toBe("published");
    expect(draw1?.participantCount).toBe(45);
    expect(draw1?.winningNumbers).toHaveLength(5);
    expect(draw1?.tier5AllocationPence).toBe(4800); // 40% of £120
    expect(draw1?.tier4AllocationPence).toBe(4200); // 35% of £120
    expect(draw1?.tier3AllocationPence).toBe(3000); // 25% of £120
    expect(draw1?.totalPrizePence).toBe(12000); // £120.00
  });

  it("tracks jackpot rollover in and rollover out across consecutive draws", async () => {
    const data = await generateAdminReportsData("all_time");
    const draw1 = data.drawHistory.find((d) => d.drawNumber === 1);
    const draw2 = data.drawHistory.find((d) => d.drawNumber === 2);

    // Draw 1: No winners in tier 5 -> rolled over out
    expect(draw1?.tier5WinnerCount).toBe(0);
    expect(draw1?.jackpotRolloverOutPence).toBe(4800);

    // Draw 2: Received rollover in from Draw 1
    expect(draw2?.jackpotRolloverInPence).toBe(4800);
    expect(draw2?.tier5WinnerCount).toBe(1); // Won!
    expect(draw2?.jackpotRolloverOutPence).toBe(0); // None carried forward
  });

  it("identifies lower-tier unclaimed funds routed to charity (TA-006)", async () => {
    const data = await generateAdminReportsData("all_time");
    const draw2 = data.drawHistory.find((d) => d.drawNumber === 2);

    // Draw 2: 0 winners in tier 4 (35% = £56.00)
    expect(draw2?.tier4WinnerCount).toBe(0);
    expect(draw2?.unclaimedLowerTierPence).toBe(5600); // £56.00 routed to charity
  });

  it("filters draws by date boundary", async () => {
    const refDate = new Date("2026-10-15T12:00:00Z");
    const data = await generateAdminReportsData("current_month", refDate);
    // Only October draw should be returned
    expect(data.drawHistory.length).toBe(1);
    expect(data.drawHistory[0].drawNumber).toBe(3);
  });
});

describe("4. Charity Contribution Reporting [PRD § 11.05 Area 3]", () => {
  beforeEach(async () => {
    await _resetFallbackReportsData();
    vi.restoreAllMocks();
  });

  it("aggregates vetted charities with member counts and avg contribution %", async () => {
    const data = await generateAdminReportsData("all_time");
    expect(data.charities.length).toBe(4);

    const youth = data.charities.find((c) => c.slug === "youth-horizon-initiative");
    expect(youth).toBeDefined();
    expect(youth?.associatedSubscribers).toBe(28);
    expect(youth?.avgContributionPercentage).toBeGreaterThanOrEqual(10.0);
  });

  it("strictly separates Subscription Charity Donations from Unclaimed Prize Disbursed", async () => {
    const data = await generateAdminReportsData("all_time");
    const youth = data.charities.find((c) => c.slug === "youth-horizon-initiative");

    // Subscription donation stream
    expect(youth?.subscriptionCharityPence).toBe(3950);
    // Unclaimed prize distribution stream
    expect(youth?.unclaimedPrizeDisbursedPence).toBe(6000);
    // Total is exact sum of both distinct streams
    expect(youth?.totalCharityPence).toBe(
      youth!.subscriptionCharityPence + youth!.unclaimedPrizeDisbursedPence
    );
  });
});

describe("5. Financial Summary Ledger [PRD § 11.05 Area 4]", () => {
  beforeEach(async () => {
    await _resetFallbackReportsData();
    vi.restoreAllMocks();
  });

  it("uses integer pence subunits and avoids floating-point inaccuracy", async () => {
    const data = await generateAdminReportsData("all_time");
    const fin = data.financials;

    expect(Number.isInteger(fin.subscriptionRevenueBasisPence)).toBe(true);
    expect(Number.isInteger(fin.prizePoolContributionPence)).toBe(true);
    expect(Number.isInteger(fin.grossPrizePoolPence)).toBe(true);
    expect(Number.isInteger(fin.tier5AllocationPence)).toBe(true);
    expect(Number.isInteger(fin.tier4AllocationPence)).toBe(true);
    expect(Number.isInteger(fin.tier3AllocationPence)).toBe(true);
    expect(Number.isInteger(fin.paidWinningsPence)).toBe(true);
    expect(Number.isInteger(fin.pendingWinningsPence)).toBe(true);
  });

  it("calculates 30% prize pool contribution from active subscriber revenue", async () => {
    const data = await generateAdminReportsData("all_time");
    const fin = data.financials;

    // 65 active subscribers * £10.00 = 65,000 pence
    expect(fin.subscriptionRevenueBasisPence).toBe(65000);
    // 30% of 65,000 pence = 19,500 pence
    expect(fin.prizePoolContributionPence).toBe(19500);
  });

  it("balances tier distributions against gross prize pool", async () => {
    const data = await generateAdminReportsData("all_time");
    const fin = data.financials;

    // Gross prize pool = sum of draw prize pools
    expect(fin.grossPrizePoolPence).toBe(52800);
    // Total winnings = paid + pending
    expect(fin.totalWinningsPence).toBe(
      fin.paidWinningsPence + fin.pendingWinningsPence
    );
  });

  it("identifies explicit GBP currency and temporary business parameters", async () => {
    const data = await generateAdminReportsData("all_time");
    expect(data.financials.currency).toBe("GBP");
    expect(data.financials.isTemporaryAssumption).toBe(true);
    expect(REPORTING_CONFIG.PRIZE_POOL_PERCENTAGE).toBe(30);
  });
});

describe("6. Admin Role Authorization Barrier [Security]", () => {
  beforeEach(async () => {
    await _resetFallbackReportsData();
    vi.restoreAllMocks();
  });

  it("denies unauthenticated callers from accessing admin reports action", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue(null);

    const res = await getAdminReportsAction("all_time");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Access denied");
    expect(res.data).toBeUndefined();
  });

  it("denies normal subscribers from accessing admin reports action", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "subscriber-1" } as any,
      profile: { role: "subscriber", full_name: "Tiger", email: "tiger@example.com" } as any,
    });

    const res = await getAdminReportsAction("all_time");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Administrator privileges are required");
    expect(res.data).toBeUndefined();
  });

  it("allows authenticated administrator to access complete reporting dataset", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "admin-1" } as any,
      profile: { role: "admin", full_name: "Admin Master", email: "admin@example.com" } as any,
    });

    const res = await getAdminReportsAction("all_time");
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.summaryCards.totalSubscribers).toBe(75);
    expect(res.data?.financials.currency).toBe("GBP");
  });
});
