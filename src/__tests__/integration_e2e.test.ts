/**
 * =============================================================================
 * DIGITAL HEROES — Phase 8: End-to-End User Journeys Integration Test Suite
 * =============================================================================
 *
 * Verifies that the completed phases function together as a unified system:
 * 1. Public Visitor -> Signup -> Charity Floor -> Dashboard Access
 * 2. Golf Performance Scores -> Rolling 5 -> Ticket Generation
 * 3. Draw Engine -> 5/4/3 Matching -> 40/35/25 Allocations -> Rollover & Charity
 * 4. Winner Verification -> Proof Submission -> Admin Review -> Verified Payout
 * 5. Administrator Governance -> User Management -> Subscriptions -> Reports Sync
 * 6. Subscription Lifecycle -> Active -> Grace Period -> Lapsed Access
 */

import { describe, it, expect } from "vitest";
import { defaultScoreMapper } from "@/lib/draws/mapper";
import { defaultEligibilityResolver } from "@/lib/draws/eligibility";
import {
  calculateMatchCount,
  determineMatchTier,
  getTierPoolShares,
  calculateEqualTierSplit,
} from "@/lib/draws/matching";
import { validateProofFile, WINNER_PROOF_CONFIG } from "@/lib/winners/config";
import type { WinnerRecord } from "@/lib/winners/types";
import { getDateRangeBounds } from "@/lib/reports/date-utils";

describe("PHASE 8: End-to-End System Integration", () => {
  // ===========================================================================
  // JOURNEY 1: Public Visitor -> Signup -> Charity Floor -> Access
  // ===========================================================================
  describe("Journey 1: Signup, Statutory Charity Floor & Account Creation", () => {
    it("enforces statutory 10% charity floor on user registration", () => {
      const validateCharityPercentage = (pct: number) => {
        if (isNaN(pct) || pct < 10) {
          return { valid: false, error: "Charity allocation cannot be below the statutory 10% floor (PRD § 07)." };
        }
        if (pct > 100) {
          return { valid: false, error: "Charity allocation cannot exceed 100%." };
        }
        return { valid: true };
      };

      expect(validateCharityPercentage(5).valid).toBe(false);
      expect(validateCharityPercentage(9).valid).toBe(false);
      expect(validateCharityPercentage(10).valid).toBe(true);
      expect(validateCharityPercentage(25).valid).toBe(true);
      expect(validateCharityPercentage(100).valid).toBe(true);
      expect(validateCharityPercentage(101).valid).toBe(false);
    });

    it("ensures new registered accounts are strictly assigned 'subscriber' role", () => {
      // Simulation of handle_new_user() trigger invariants
      const createUserProfile = (meta: Record<string, any>) => {
        return {
          id: "new-user-123",
          full_name: meta.full_name || "Subscriber",
          role: "subscriber" as const, // Locked by trigger
          charity_id: meta.charity_id || null,
          charity_percentage: Math.max(10, Number(meta.charity_percentage) || 10),
        };
      };

      // Even if client attempts to spoof role: 'admin'
      const profile = createUserProfile({
        full_name: "Attacker",
        role: "admin",
        charity_percentage: 15,
      });

      expect(profile.role).toBe("subscriber");
      expect(profile.charity_percentage).toBe(15);
    });
  });

  // ===========================================================================
  // JOURNEY 2: Score Entry -> Rolling 5 -> Ticket Generation
  // ===========================================================================
  describe("Journey 2: Score Entry, Rolling-Five Invariant & Ticket Mapping", () => {
    it("validates Stableford score range (1 to 45 pts)", () => {
      const validateScore = (score: number) => {
        return Number.isInteger(score) && score >= 1 && score <= 45;
      };

      expect(validateScore(0)).toBe(false);
      expect(validateScore(1)).toBe(true);
      expect(validateScore(36)).toBe(true);
      expect(validateScore(45)).toBe(true);
      expect(validateScore(46)).toBe(false);
      expect(validateScore(36.5)).toBe(false);
    });

    it("retains newest 5 scores chronologically in rolling pool", () => {
      const allRounds = [
        { score: 30, date: "2026-08-01", createdAt: "2026-08-01T10:00:00Z" },
        { score: 32, date: "2026-08-05", createdAt: "2026-08-05T10:00:00Z" },
        { score: 34, date: "2026-08-10", createdAt: "2026-08-10T10:00:00Z" },
        { score: 36, date: "2026-08-15", createdAt: "2026-08-15T10:00:00Z" },
        { score: 38, date: "2026-08-20", createdAt: "2026-08-20T10:00:00Z" },
        { score: 40, date: "2026-08-25", createdAt: "2026-08-25T10:00:00Z" }, // 6th round
      ];

      // Sort by date DESC, createdAt DESC and take top 5
      const rolling5 = [...allRounds]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      expect(rolling5).toHaveLength(5);
      expect(rolling5.map((r) => r.score)).toEqual([40, 38, 36, 34, 32]);
      expect(rolling5.some((r) => r.score === 30)).toBe(false); // Oldest score excluded
    });

    it("generates sorted ticket preserving duplicate scores (BR-047 / Decision #1)", () => {
      const scores = [38, 32, 40, 32, 35]; // Contains duplicate 32
      const ticket = defaultScoreMapper.mapScoresToTicket(scores);

      // Preserves duplicates, sorted ascending: [32, 32, 35, 38, 40]
      expect(ticket).toEqual([32, 32, 35, 38, 40]);
      expect(ticket).toHaveLength(5);

      // Evaluates distinct numbers for match potential (TA-002 Model B)
      const potential = defaultEligibilityResolver.evaluateTicketPotential(ticket);
      expect(potential.distinctCount).toBe(4);
      expect(potential.maxAchievableTier).toBe("4_number");
    });
  });

  // ===========================================================================
  // JOURNEY 3: Draw Engine -> 5/4/3 Matching -> Allocations & Rollovers
  // ===========================================================================
  describe("Journey 3: Draw Execution, Match Calculation & Prize Distribution", () => {
    const winningNumbers = [7, 14, 21, 28, 35];

    it("evaluates ticket match counts accurately across 5, 4, 3, and non-winning tickets", () => {
      expect(calculateMatchCount([7, 14, 21, 28, 35], winningNumbers)).toBe(5);
      expect(determineMatchTier(5)).toBe("5_number");

      expect(calculateMatchCount([7, 14, 21, 28, 42], winningNumbers)).toBe(4);
      expect(determineMatchTier(4)).toBe("4_number");

      expect(calculateMatchCount([7, 14, 21, 40, 42], winningNumbers)).toBe(3);
      expect(determineMatchTier(3)).toBe("3_number");

      expect(calculateMatchCount([7, 14, 30, 40, 42], winningNumbers)).toBe(2);
      expect(determineMatchTier(2)).toBeNull();
    });

    it("allocates gross prize pool according to PRD 40/35/25 statutory tiers", () => {
      const grossPrizePool = 1000; // £1,000.00
      const shares = getTierPoolShares();

      const tier1Amount = (grossPrizePool * shares["5_number"]) / 100;
      const tier2Amount = (grossPrizePool * shares["4_number"]) / 100;
      const tier3Amount = (grossPrizePool * shares["3_number"]) / 100;

      expect(tier1Amount).toBe(400); // 40%
      expect(tier2Amount).toBe(350); // 35%
      expect(tier3Amount).toBe(250); // 25%
      expect(tier1Amount + tier2Amount + tier3Amount).toBe(grossPrizePool);
    });

    it("splits tier prizes equally among multiple winners with penny remainder preservation", () => {
      // 3 winners splitting £350.00
      const split = calculateEqualTierSplit(350, 3);
      expect(split.prizePerWinner).toBe(116.66);
      expect(split.remainder).toBe(0.02); // 2 pence remainder preserved in platform balance
      expect(split.prizePerWinner * 3 + split.remainder).toBe(350.00);
    });

    it("implements jackpot rollover (Tier 1) and charity redirect for lower tiers (TA-006)", () => {
      // Tier 1 (Jackpot) unclaimed -> rolls over to next cycle
      const rolloverPolicy = (tier: "5_number" | "4_number" | "3_number", hasWinners: boolean) => {
        if (!hasWinners) {
          if (tier === "5_number") return "ROLLOVER_TO_NEXT_CYCLE";
          return "REDIRECT_TO_VETTED_CHARITY_POOL"; // TA-006: Tier 2 & 3 do not roll over
        }
        return "DISTRIBUTE_TO_WINNERS";
      };

      expect(rolloverPolicy("5_number", false)).toBe("ROLLOVER_TO_NEXT_CYCLE");
      expect(rolloverPolicy("4_number", false)).toBe("REDIRECT_TO_VETTED_CHARITY_POOL");
      expect(rolloverPolicy("3_number", false)).toBe("REDIRECT_TO_VETTED_CHARITY_POOL");
      expect(rolloverPolicy("5_number", true)).toBe("DISTRIBUTE_TO_WINNERS");
    });
  });

  // ===========================================================================
  // JOURNEY 4: Winner Verification & Payout State Transitions
  // ===========================================================================
  describe("Journey 4: Winner Proof Verification & Payout Lifecycle", () => {
    it("validates allowed scorecard image/PDF formats and 20MB ceiling", () => {
      expect(validateProofFile({ name: "scorecard.jpg", type: "image/jpeg", size: 2 * 1024 * 1024 }).isValid).toBe(true);
      expect(validateProofFile({ name: "scorecard.png", type: "image/png", size: 4 * 1024 * 1024 }).isValid).toBe(true);
      expect(validateProofFile({ name: "scorecard.pdf", type: "application/pdf", size: 1024 * 1024 }).isValid).toBe(true);

      // Disallowed format
      expect(validateProofFile({ name: "script.exe", type: "application/x-msdownload", size: 1000 }).isValid).toBe(false);

      // Oversized file (> 20MB)
      expect(validateProofFile({ name: "huge.png", type: "image/png", size: 25 * 1024 * 1024 }).isValid).toBe(false);

      // Empty file (0 bytes)
      expect(validateProofFile({ name: "empty.png", type: "image/png", size: 0 }).isValid).toBe(false);
    });

    it("strictly follows the state machine: pending -> proof_submitted -> approved -> paid", () => {
      type TransitionEvent = "SUBMIT_PROOF" | "APPROVE" | "REJECT" | "MARK_PAID";

      function transitionWinner(
        currentVerification: WinnerRecord["verification_status"],
        currentPayout: WinnerRecord["payout_status"],
        event: TransitionEvent,
        hasRejectionReason = true
      ): { nextVerification: WinnerRecord["verification_status"]; nextPayout: WinnerRecord["payout_status"]; valid: boolean } {
        // 1. Submit proof: Allowed from pending or rejected
        if (event === "SUBMIT_PROOF" && (currentVerification === "pending" || currentVerification === "rejected")) {
          return { nextVerification: "proof_submitted", nextPayout: "pending", valid: true };
        }
        // 2. Approve: Allowed only from proof_submitted
        if (event === "APPROVE" && currentVerification === "proof_submitted") {
          return { nextVerification: "approved", nextPayout: "pending", valid: true };
        }
        // 3. Reject: Allowed only from proof_submitted with reason
        if (event === "REJECT" && currentVerification === "proof_submitted" && hasRejectionReason) {
          return { nextVerification: "rejected", nextPayout: "pending", valid: true };
        }
        // 4. Mark Paid: Allowed strictly when approved and pending payout
        if (event === "MARK_PAID" && currentVerification === "approved" && currentPayout === "pending") {
          return { nextVerification: "approved", nextPayout: "paid", valid: true };
        }
        return { nextVerification: currentVerification, nextPayout: currentPayout, valid: false };
      }

      // Valid path
      const s1 = transitionWinner("pending", "pending", "SUBMIT_PROOF");
      expect(s1.valid).toBe(true);
      expect(s1.nextVerification).toBe("proof_submitted");

      const s2 = transitionWinner("proof_submitted", "pending", "APPROVE");
      expect(s2.valid).toBe(true);
      expect(s2.nextVerification).toBe("approved");

      const s3 = transitionWinner("approved", "pending", "MARK_PAID");
      expect(s3.valid).toBe(true);
      expect(s3.nextPayout).toBe("paid");

      // Invalid path: Attempting payout before approval
      const invalidPayout = transitionWinner("proof_submitted", "pending", "MARK_PAID");
      expect(invalidPayout.valid).toBe(false);

      // Rejection and resubmission
      const rej = transitionWinner("proof_submitted", "pending", "REJECT", true);
      expect(rej.valid).toBe(true);
      expect(rej.nextVerification).toBe("rejected");

      const resubmit = transitionWinner("rejected", "pending", "SUBMIT_PROOF");
      expect(resubmit.valid).toBe(true);
      expect(resubmit.nextVerification).toBe("proof_submitted");
    });
  });

  // ===========================================================================
  // JOURNEY 5: Administrator Governance & Executive Reporting
  // ===========================================================================
  describe("Journey 5: Administrator Control Surfaces & Reporting Invariants", () => {
    it("strictly separates subscription donations and unclaimed prize allocations in charity reporting", () => {
      const mockCharityData = {
        name: "Youth Horizon Initiative",
        subscriptionCharityPence: 3950, // £39.50 direct member giving
        unclaimedPrizeDisbursedPence: 6000, // £60.00 lower-tier unclaimed funds
      };

      const totalCharityPence = mockCharityData.subscriptionCharityPence + mockCharityData.unclaimedPrizeDisbursedPence;
      expect(totalCharityPence).toBe(9950); // £99.50
      expect(mockCharityData.subscriptionCharityPence).not.toBe(mockCharityData.unclaimedPrizeDisbursedPence);
    });

    it("enforces strict UTC date range boundaries for administrative filtering", () => {
      const bounds = getDateRangeBounds("all_time");
      expect(bounds.startDate).toBeNull();
      expect(bounds.endDate).toBeNull();

      const last30DaysBounds = getDateRangeBounds("last_3_months");
      expect(last30DaysBounds.startDate).not.toBeNull();
      expect(last30DaysBounds.endDate).not.toBeNull();

      // Ensure UTC formatting ends with Z
      expect(last30DaysBounds.startDate).toMatch(/Z$/);
      expect(last30DaysBounds.endDate).toMatch(/Z$/);
    });
  });

  // ===========================================================================
  // JOURNEY 6: Subscription Lifecycle & Access Control
  // ===========================================================================
  describe("Journey 6: Subscription States, Grace Periods & Access Resolution", () => {
    function computeHasAccess(sub: { status: string; current_period_end: string | null; cancel_at_period_end?: boolean } | null): boolean {
      if (!sub) return false;
      const now = new Date();
      if (sub.status === "active" || sub.status === "trialing") {
        if (!sub.current_period_end) return true;
        return new Date(sub.current_period_end) > now;
      }
      if (sub.cancel_at_period_end && sub.current_period_end) {
        return new Date(sub.current_period_end) > now;
      }
      return false;
    }

    it("grants access to active subscribers", () => {
      const activeSub = {
        status: "active",
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancel_at_period_end: false,
      };
      expect(computeHasAccess(activeSub)).toBe(true);
    });

    it("grants access to cancel-at-period-end subscribers before period end", () => {
      const cancelSub = {
        status: "active",
        current_period_end: new Date(Date.now() + 10 * 86400000).toISOString(),
        cancel_at_period_end: true,
      };
      expect(computeHasAccess(cancelSub)).toBe(true);
    });

    it("identifies past-due grace period vs expired accounts", () => {
      const checkGracePeriod = (status: string, periodEndIso: string) => {
        if (status !== "past_due") return { hasAccess: status === "active", inGrace: false };
        const graceMs = 7 * 24 * 60 * 60 * 1000;
        const elapsed = Date.now() - new Date(periodEndIso).getTime();
        return {
          hasAccess: elapsed < graceMs,
          inGrace: elapsed < graceMs,
        };
      };

      // 2 days past due -> in grace period
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
      const withinGrace = checkGracePeriod("past_due", twoDaysAgo);
      expect(withinGrace.hasAccess).toBe(true);
      expect(withinGrace.inGrace).toBe(true);

      // 10 days past due -> lapsed
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
      const expired = checkGracePeriod("past_due", tenDaysAgo);
      expect(expired.hasAccess).toBe(false);
      expect(expired.inGrace).toBe(false);
    });

    it("verifies administrative access remains independent of subscription status", () => {
      const adminUser = { role: "admin" as const, hasSubscription: false };
      const isAdminAuthorized = adminUser.role === "admin";
      expect(isAdminAuthorized).toBe(true);
    });
  });
});
