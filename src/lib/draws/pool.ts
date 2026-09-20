/**
 * =============================================================================
 * DIGITAL HEROES — Phase 5: Prize Pool Calculator & Accounting Engine
 * PRD Reference: § 06 (Draw & Reward System), § 07 (Prize Pool Logic)
 * Temporary Assumptions: TA-001 (30%), TA-003 (GBP), TA-004 (£10), TA-005 (£100), TA-006 (Charity)
 * =============================================================================
 *
 * GOVERNING RULES:
 * 1. Financial calculations use integer subunits (pence) to eliminate floating-point drift.
 * 2. Subscription MER is calculated:
 *    - Monthly: 1000 pence (£10.00)
 *    - Yearly: 833 pence (£100.00 / 12 months, floored)
 * 3. Gross prize pool = 30% of aggregate MER.
 * 4. Tier allocations:
 *    - 5-number match: 40% of gross pool + jackpot rollover in
 *    - 4-number match: 35% of gross pool
 *    - 3-number match: 25% of gross pool
 * 5. Rollover & Unclaimed Funds:
 *    - Tier 5 unclaimed -> rolls over to next month's Tier 5 jackpot (PRD § 07).
 *    - Tier 4 & Tier 3 unclaimed -> assigned to charity disposition ledger (TA-006).
 *    - Multi-winner splits: prize_per_winner = floor(tier_pool / winner_count).
 *      Penny remainders are preserved in remainder_amount.
 */

import {
  TEMPORARY_ASSUMPTIONS,
  PRD_TIER_PERCENTAGES,
  getMonthlyEquivalentRevenuePence,
} from "./config";
import {
  DetailedTierAllocation,
  FullPrizePoolBreakdown,
  IPrizePoolCalculator,
  MatchTier,
} from "./types";

export interface SubscriberPlanCount {
  monthly: number;
  yearly: number;
}

export interface PrizeCalculationInput {
  subscribers: SubscriberPlanCount | number; // Exact plan counts or total count
  winnerCounts: Record<MatchTier, number>;
  jackpotRolloverInPence?: number;
}

export class ProductionPrizePoolCalculator implements IPrizePoolCalculator {
  /**
   * Conforms to the IPrizePoolCalculator interface.
   * Calculates gross pool and static tier allocations based on active subscriber count.
   */
  public calculatePool(
    activeSubscriberCount: number,
    subscriptionRatePence: number = TEMPORARY_ASSUMPTIONS.TA_004_MONTHLY_PRICE_PENCE
  ) {
    const totalMer = activeSubscriberCount * subscriptionRatePence;
    const grossPool = Math.floor(
      (totalMer * TEMPORARY_ASSUMPTIONS.TA_001_PRIZE_POOL_PERCENTAGE) / 100
    );

    const t5Amount = Math.floor(grossPool * (PRD_TIER_PERCENTAGES["5_number"] / 100));
    const t4Amount = Math.floor(grossPool * (PRD_TIER_PERCENTAGES["4_number"] / 100));
    const t3Amount = Math.floor(grossPool * (PRD_TIER_PERCENTAGES["3_number"] / 100));

    return {
      grossPool,
      tierAllocations: {
        "5_number": {
          percentage: PRD_TIER_PERCENTAGES["5_number"],
          amount: t5Amount,
        },
        "4_number": {
          percentage: PRD_TIER_PERCENTAGES["4_number"],
          amount: t4Amount,
        },
        "3_number": {
          percentage: PRD_TIER_PERCENTAGES["3_number"],
          amount: t3Amount,
        },
      },
    };
  }

  /**
   * Executes the full deterministic prize pool accounting with integer pence,
   * rollover tracking, winner split division, and lower-tier charity disposition.
   */
  public calculateFullBreakdown(input: PrizeCalculationInput): FullPrizePoolBreakdown {
    const rolloverIn = Math.max(0, input.jackpotRolloverInPence || 0);

    // Compute aggregate Monthly Equivalent Revenue in pence
    let totalMerPence = 0;
    if (typeof input.subscribers === "number") {
      totalMerPence = input.subscribers * TEMPORARY_ASSUMPTIONS.TA_004_MONTHLY_PRICE_PENCE;
    } else {
      totalMerPence =
        input.subscribers.monthly * getMonthlyEquivalentRevenuePence("monthly") +
        input.subscribers.yearly * getMonthlyEquivalentRevenuePence("yearly");
    }

    // Gross New Prize Pool = 30% of aggregate MER
    const grossNewPool = Math.floor(
      (totalMerPence * TEMPORARY_ASSUMPTIONS.TA_001_PRIZE_POOL_PERCENTAGE) / 100
    );

    // Baseline tier shares from current cycle revenue
    const t5New = Math.floor(grossNewPool * (PRD_TIER_PERCENTAGES["5_number"] / 100));
    const t4New = Math.floor(grossNewPool * (PRD_TIER_PERCENTAGES["4_number"] / 100));
    const t3New = Math.floor(grossNewPool * (PRD_TIER_PERCENTAGES["3_number"] / 100));

    // Tier 5 (Jackpot): includes rollover from prior cycles
    const t5TotalAvailable = t5New + rolloverIn;
    const w5 = input.winnerCounts["5_number"] || 0;
    let t5Allocated = 0;
    let t5PerWinner = 0;
    let t5Unclaimed = 0;
    let t5Remainder = 0;
    let t5Disposition: "CHARITY" | "ROLLOVER" | null = null;
    let jackpotRolloverOut = 0;

    if (w5 > 0) {
      t5PerWinner = Math.floor(t5TotalAvailable / w5);
      t5Allocated = t5PerWinner * w5;
      t5Remainder = t5TotalAvailable - t5Allocated;
      t5Unclaimed = 0;
      jackpotRolloverOut = 0;
    } else {
      t5Unclaimed = t5TotalAvailable;
      t5Disposition = "ROLLOVER";
      jackpotRolloverOut = t5TotalAvailable;
    }

    // Tier 4: Does NOT roll over; unclaimed goes to charity (TA-006)
    const w4 = input.winnerCounts["4_number"] || 0;
    let t4Allocated = 0;
    let t4PerWinner = 0;
    let t4Unclaimed = 0;
    let t4Remainder = 0;
    let t4Disposition: "CHARITY" | "ROLLOVER" | null = null;

    if (w4 > 0) {
      t4PerWinner = Math.floor(t4New / w4);
      t4Allocated = t4PerWinner * w4;
      t4Remainder = t4New - t4Allocated;
      t4Unclaimed = 0;
    } else {
      t4Unclaimed = t4New;
      t4Disposition = "CHARITY";
    }

    // Tier 3: Does NOT roll over; unclaimed goes to charity (TA-006)
    const w3 = input.winnerCounts["3_number"] || 0;
    let t3Allocated = 0;
    let t3PerWinner = 0;
    let t3Unclaimed = 0;
    let t3Remainder = 0;
    let t3Disposition: "CHARITY" | "ROLLOVER" | null = null;

    if (w3 > 0) {
      t3PerWinner = Math.floor(t3New / w3);
      t3Allocated = t3PerWinner * w3;
      t3Remainder = t3New - t3Allocated;
      t3Unclaimed = 0;
    } else {
      t3Unclaimed = t3New;
      t3Disposition = "CHARITY";
    }

    const charityDispositionTotal =
      (t4Disposition === "CHARITY" ? t4Unclaimed : 0) +
      (t3Disposition === "CHARITY" ? t3Unclaimed : 0);

    const totalAllocatedToWinners = t5Allocated + t4Allocated + t3Allocated;
    const totalRemainder = t5Remainder + t4Remainder + t3Remainder;

    const tierAllocations: Record<MatchTier, DetailedTierAllocation> = {
      "5_number": {
        tier: "5_number",
        poolPercentage: PRD_TIER_PERCENTAGES["5_number"],
        allocatedAmount: t5TotalAvailable,
        winnerCount: w5,
        prizePerWinner: t5PerWinner,
        unclaimedAmount: t5Unclaimed,
        disposition: t5Disposition,
        remainderAmount: t5Remainder,
      },
      "4_number": {
        tier: "4_number",
        poolPercentage: PRD_TIER_PERCENTAGES["4_number"],
        allocatedAmount: t4New,
        winnerCount: w4,
        prizePerWinner: t4PerWinner,
        unclaimedAmount: t4Unclaimed,
        disposition: t4Disposition,
        remainderAmount: t4Remainder,
      },
      "3_number": {
        tier: "3_number",
        poolPercentage: PRD_TIER_PERCENTAGES["3_number"],
        allocatedAmount: t3New,
        winnerCount: w3,
        prizePerWinner: t3PerWinner,
        unclaimedAmount: t3Unclaimed,
        disposition: t3Disposition,
        remainderAmount: t3Remainder,
      },
    };

    return {
      grossNewPool,
      totalPoolWithRollover: grossNewPool + rolloverIn,
      jackpotRolloverIn: rolloverIn,
      jackpotRolloverOut,
      charityDispositionTotal,
      totalAllocatedToWinners,
      totalRemainder,
      tierAllocations,
    };
  }
}

/**
 * Singleton instance of the default Production Prize Pool Calculator.
 */
export const defaultPrizePoolCalculator = new ProductionPrizePoolCalculator();

/**
 * Utility helper to format integer pence as a localized GBP string (e.g. 1000 -> "£10.00").
 */
export function formatPenceToGBP(pence: number): string {
  const pounds = pence / 100;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pounds);
}
