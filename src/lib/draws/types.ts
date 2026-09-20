/**
 * =============================================================================
 * DIGITAL HEROES — Phase 5: Draw Engine & Prize Pool Types & Interfaces
 * PRD Reference: § 06 (Draw & Reward System), § 07 (Prize Pool Logic)
 * Business Rules: BR-040 – BR-066
 * =============================================================================
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * All business rules currently marked STATUS: OPEN DECISION are decoupled
 * behind abstract interfaces (strategy pattern).
 *
 * UNRESOLVED BUSINESS DECISIONS (PRESERVED):
 *   1. Score-to-draw mapping (Open Decision 1 / A-013) -> IScoreToTicketMapper
 *   2. Algorithmic weighting formula (Open Decision 2 / A-011) -> IDrawExecutionStrategy
 *   3. Subscription percentage to prize pool (Open Decision 3 / A-010) -> IPrizePoolCalculator
 *   4. Eligibility when fewer than 5 scores exist (Open Decision 4 / A-012) -> IDrawEligibilityResolver
 *   5. Currency & subscription pricing (Open Decision 5 / A-020) -> Configurable / external
 *   6. Treatment of unclaimed 3/4-tier funds (Open Decision 8 / A-022) -> Configurable / external
 *
 * NO values for these 6 decisions are hardcoded in application logic.
 */

/**
 * Draw lifecycle state machine:
 * draft -> simulated -> published (terminal)
 * cancelled is an administrative abort state prior to payout.
 */
export type DrawStatus = "draft" | "simulated" | "published" | "cancelled";

/**
 * Draw mode specified by PRD § 06:
 * - random: Standard lottery-style draw
 * - algorithmic: Weighted by score frequency (formula: OPEN DECISION)
 */
export type DrawMode = "random" | "algorithmic";

/**
 * Match tiers mandated by PRD § 06 & § 07:
 * - 5_number: 40% pool share (Jackpot rollover: Yes)
 * - 4_number: 35% pool share (Rollover: No)
 * - 3_number: 25% pool share (Rollover: No)
 */
export type MatchTier = "5_number" | "4_number" | "3_number";

/**
 * Winner verification lifecycle (PRD § 09):
 */
export type WinnerVerificationStatus =
  | "pending"
  | "proof_submitted"
  | "approved"
  | "rejected";

/**
 * Winner payout lifecycle (PRD § 09):
 */
export type WinnerPayoutStatus = "pending" | "paid";

/**
 * Represents a row in the public.draws database table.
 */
export interface DrawRecord {
  id: string;
  draw_number: number;
  month: string; // ISO date 'YYYY-MM-01' representing the draw cycle month
  draw_mode: DrawMode;
  status: DrawStatus;
  winning_numbers: number[] | null;
  total_subscribers_snapshot: number | null;
  total_prize_pool: number | null; // Nullable until configured / determined
  jackpot_rollover_in: number;
  jackpot_rollover_out: number;
  simulation_run_at: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a row in the public.draw_entries database table.
 * Immutable snapshot of a subscriber's participating entry in a specific draw.
 */
export interface DrawEntryRecord {
  id: string;
  draw_id: string;
  user_id: string;
  numbers: number[]; // The ticket numbers
  match_count: number | null; // Calculated matches against winning_numbers
  created_at: string;
}

/**
 * Represents a row in the public.draw_tier_allocations database table.
 * Breakdown of prize pool per match tier for a specific draw.
 */
export interface DrawTierAllocationRecord {
  id: string;
  draw_id: string;
  tier: MatchTier;
  pool_percentage: number; // 40.00, 35.00, 25.00 (PRD § 07)
  allocated_amount: number | null;
  winner_count: number;
  prize_per_winner: number | null;
  unclaimed_amount: number;
  disposition: string | null;
  remainder_amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a row in the public.winners database table.
 */
export interface WinnerRecord {
  id: string;
  draw_id: string;
  user_id: string;
  match_tier: MatchTier;
  prize_amount: number | null; // Nullable until prize pool is computed
  verification_status: WinnerVerificationStatus;
  payout_status: WinnerPayoutStatus;
  proof_file_url: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// PROVIDER-INDEPENDENT STRATEGY INTERFACES
// =============================================================================

/**
 * Context provided to a draw generation strategy.
 */
export interface DrawGenerationContext {
  drawId: string;
  month: string;
  mode: DrawMode;
  /** Custom seed for reproducible testing or verified execution */
  randomSeed?: string;
  /** Optional frequency distribution if algorithmic mode is approved */
  frequencyDistribution?: Record<number, number>;
}

/**
 * Strategy interface for draw number generation.
 * Decouples random vs algorithmic generation without baking in business formulas.
 */
export interface IDrawExecutionStrategy {
  readonly mode: DrawMode;
  generateWinningNumbers(context: DrawGenerationContext): Promise<number[]>;
}

/**
 * Strategy interface for converting a user's rolling scores into a draw ticket.
 * Decouples Open Decision 1 (Score-to-draw mapping).
 */
export interface IScoreToTicketMapper {
  mapScoresToTicket(scores: number[]): number[];
}

/**
 * Strategy interface for determining if a user qualifies for a draw.
 * Decouples Open Decision 4 (Eligibility for < 5 scores).
 */
export interface IDrawEligibilityResolver {
  isEligible(scoreCount: number, hasActiveSubscription: boolean): boolean;
}

export interface DetailedTierAllocation {
  tier: MatchTier;
  poolPercentage: number;
  allocatedAmount: number;
  winnerCount: number;
  prizePerWinner: number;
  unclaimedAmount: number;
  disposition: "CHARITY" | "ROLLOVER" | null;
  remainderAmount: number;
}

export interface FullPrizePoolBreakdown {
  grossNewPool: number;
  totalPoolWithRollover: number;
  jackpotRolloverIn: number;
  jackpotRolloverOut: number;
  charityDispositionTotal: number;
  totalAllocatedToWinners: number;
  totalRemainder: number;
  tierAllocations: Record<MatchTier, DetailedTierAllocation>;
}

/**
 * Strategy interface for calculating the gross prize pool.
 * Decouples Open Decision 3 (Subscription % to prize pool).
 */
export interface IPrizePoolCalculator {
  calculatePool(activeSubscriberCount: number, subscriptionRate?: number): {
    grossPool: number | null;
    tierAllocations: Record<MatchTier, { percentage: number; amount: number | null }>;
  };
}

/**
 * Standard server action response wrapper for draw operations.
 */
export interface DrawActionResponse {
  success: boolean;
  error?: string;
  draw?: DrawRecord;
}
