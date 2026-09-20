/**
 * =============================================================================
 * DIGITAL HEROES — Phase 5: Pure Draw Matching & Testing Harness Utilities
 * PRD Reference: § 06 & § 07
 * Business Rules: BR-041 (tiers), BR-061 (shares), BR-063 (equal split)
 * =============================================================================
 *
 * NOTE: This module contains strictly pure mathematical and array-matching
 * helper functions. It does NOT invent score-to-ticket conversion or
 * draw distribution formulas.
 */

import type { MatchTier } from "./types";

/**
 * Calculates the number of matching elements between a ticket and winning numbers.
 * Treats numbers as a set (unordered intersection).
 */
export function calculateMatchCount(
  ticketNumbers: number[],
  winningNumbers: number[]
): number {
  if (!Array.isArray(ticketNumbers) || !Array.isArray(winningNumbers)) {
    return 0;
  }
  const winningSet = new Set(winningNumbers);
  // Unordered set-based matching per BR-047: duplicates on ticket match once against distinct drawn numbers
  const distinctTicket = Array.from(new Set(ticketNumbers));
  return distinctTicket.filter((n) => winningSet.has(n)).length;
}

/**
 * Maps a match count to the corresponding PRD § 06 match tier.
 * Returns null if the match count is fewer than 3.
 */
export function determineMatchTier(matchCount: number): MatchTier | null {
  if (matchCount >= 5) return "5_number";
  if (matchCount === 4) return "4_number";
  if (matchCount === 3) return "3_number";
  return null;
}

/**
 * Returns the statutory PRD § 07 tier pool percentage shares:
 * - 5-number: 40%
 * - 4-number: 35%
 * - 3-number: 25%
 * Total = 100% of the prize pool.
 */
export function getTierPoolShares(): Record<MatchTier, number> {
  return {
    "5_number": 40.0,
    "4_number": 35.0,
    "3_number": 25.0,
  };
}

/**
 * Computes equal split among multiple winners within a tier (PRD § 07 / BR-063).
 * Returns both the per-winner allocation and any fractional remainder.
 *
 * NOTE: This is a pure mathematical division helper. Rounding policies
 * for production ledger balance remain dependent on currency resolution.
 */
export function calculateEqualTierSplit(
  tierAllocatedAmount: number,
  winnerCount: number
): {
  prizePerWinner: number;
  remainder: number;
} {
  if (winnerCount <= 0 || tierAllocatedAmount <= 0) {
    return { prizePerWinner: 0, remainder: 0 };
  }

  // Integer cents computation to avoid floating-point drift
  const totalCents = Math.round(tierAllocatedAmount * 100);
  const centsPerWinner = Math.floor(totalCents / winnerCount);
  const remainderCents = totalCents - centsPerWinner * winnerCount;

  return {
    prizePerWinner: centsPerWinner / 100,
    remainder: remainderCents / 100,
  };
}
