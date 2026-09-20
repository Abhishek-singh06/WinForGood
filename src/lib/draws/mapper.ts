/**
 * =============================================================================
 * DIGITAL HEROES — Phase 5: Score-to-Draw Ticket Mapper
 * PRD Reference: § 05 (Scores), § 06 (Draws)
 * Business Decision #1: BR-047 / A-013 (RESOLVED)
 * =============================================================================
 *
 * GOVERNING RULES (BR-047):
 * 1. Stableford scores (1–45) map directly to draw numbers (1–45).
 * 2. Duplicate scores are preserved on the ticket (e.g. [36, 36, 38, 40, 42]).
 * 3. Numbers are sorted in ascending order for canonical display & deterministic indexing.
 * 4. Empty scores array produces an empty ticket ([]).
 * 5. Tickets with fewer than 5 scores (0–4) contain exactly those scores without
 *    synthetic padding or random number insertion.
 */

import { IScoreToTicketMapper } from "./types";

export class DirectScoreToTicketMapper implements IScoreToTicketMapper {
  /**
   * Maps rolling Stableford scores directly to draw ticket numbers.
   *
   * @param scores Array of user's retained Stableford scores (1–45)
   * @returns Array of numbers representing the user's draw ticket (sorted ascending)
   */
  public mapScoresToTicket(scores: number[]): number[] {
    if (!scores || scores.length === 0) {
      return [];
    }

    // Validate that scores fall within the legal Stableford range [1, 45]
    const validScores = scores.filter((score) => {
      return (
        Number.isInteger(score) &&
        score >= 1 &&
        score <= 45
      );
    });

    // Sort ascending for canonical ticket representation
    return [...validScores].sort((a, b) => a - b);
  }
}

/**
 * Singleton instance of the default direct score-to-ticket mapper.
 */
export const defaultScoreMapper = new DirectScoreToTicketMapper();
