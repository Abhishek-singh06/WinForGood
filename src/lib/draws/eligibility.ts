/**
 * =============================================================================
 * DIGITAL HEROES — Phase 5: Draw Eligibility Resolver
 * PRD Reference: § 06 (Draw Participation)
 * Temporary PO Assumption: TA-002 (Model B: Dynamic Partial Tickets)
 * =============================================================================
 *
 * GOVERNING RULES (TA-002):
 * 1. An active subscription is the prerequisite for draw participation.
 * 2. Subscribers participate with their dynamic score ticket (0–5 retained scores).
 * 3. No synthetic or randomly generated filler numbers are inserted.
 * 4. Mathematical winning capability by distinct score count:
 *    - 0 scores: Participates with empty ticket [] -> Cannot match any tier.
 *    - 1–2 distinct scores: Cannot match minimum 3-number threshold -> Cannot win.
 *    - 3 distinct scores: Eligible to win Tier 3 (3-number match).
 *    - 4 distinct scores: Eligible to win Tier 3 or Tier 4 (4-number match).
 *    - 5 distinct scores: Eligible to win Tier 3, Tier 4, or Tier 5 (5-number jackpot).
 */

import { IDrawEligibilityResolver, MatchTier } from "./types";

export class DynamicPartialEligibilityResolver implements IDrawEligibilityResolver {
  /**
   * Evaluates if a subscriber is eligible to be entered into the monthly draw cycle.
   * Under Model B (TA-002), having an active subscription qualifies the user,
   * regardless of whether they have 0, 1, 2, 3, 4, or 5 logged scores.
   */
  public isEligible(scoreCount: number, hasActiveSubscription: boolean): boolean {
    if (!hasActiveSubscription) {
      return false;
    }
    // Any subscriber with >= 0 valid scores is entered under Model B
    return scoreCount >= 0;
  }

  /**
   * Computes the maximum winning tier mathematically achievable by a given ticket.
   * Winning numbers are 5 distinct integers, so duplicate numbers on a ticket only
   * match once against the drawn set.
   *
   * @param ticket The user's participating ticket numbers
   * @returns Maximum reachable MatchTier, or null if ticket cannot reach 3 matches
   */
  public getMaxAchievableTier(ticket: number[]): MatchTier | null {
    if (!ticket || ticket.length < 3) {
      return null;
    }

    // Set of distinct numbers in the ticket
    const distinctCount = new Set(ticket).size;

    if (distinctCount >= 5) {
      return "5_number";
    }
    if (distinctCount === 4) {
      return "4_number";
    }
    if (distinctCount === 3) {
      return "3_number";
    }
    return null;
  }

  /**
   * Detailed breakdown of a ticket's eligibility status and potential.
   */
  public evaluateTicketPotential(ticket: number[]) {
    const distinctNumbers = Array.from(new Set(ticket));
    const distinctCount = distinctNumbers.length;
    const maxTier = this.getMaxAchievableTier(ticket);

    return {
      rawCount: ticket.length,
      distinctCount,
      canWinTier3: distinctCount >= 3,
      canWinTier4: distinctCount >= 4,
      canWinTier5: distinctCount >= 5,
      maxAchievableTier: maxTier,
    };
  }
}

/**
 * Singleton instance of the default Dynamic Partial Eligibility Resolver.
 */
export const defaultEligibilityResolver = new DynamicPartialEligibilityResolver();
