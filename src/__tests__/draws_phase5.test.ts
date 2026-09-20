/**
 * =============================================================================
 * Phase 5: Draw Engine & Prize Pool Foundation — Test Suite
 *
 * Test Classification:
 *   [Static SQL] — Inspects migration SQL file for schema invariants, RLS & triggers
 *   [Unit]       — Pure deterministic matching & tier allocation arithmetic
 *   [Contract]   — Strategy interface adherence & lifecycle state rules
 * =============================================================================
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  calculateMatchCount,
  determineMatchTier,
  getTierPoolShares,
  calculateEqualTierSplit,
} from "../lib/draws/matching";
import type {
  IDrawExecutionStrategy,
  IScoreToTicketMapper,
  IDrawEligibilityResolver,
  IPrizePoolCalculator,
  DrawStatus,
  DrawMode,
  MatchTier,
} from "../lib/draws/types";

// ---------------------------------------------------------------------------
// Helpers for static SQL inspection
// ---------------------------------------------------------------------------
const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/20260920000004_phase5_draws_foundation.sql"
);

function getMigrationSQL(): string {
  return fs.readFileSync(MIGRATION_PATH, "utf-8");
}

// ===========================================================================
// SECTION 1: Static SQL / Database Schema Invariants
// ===========================================================================

describe("Phase 5 — Database Migration Schema Invariants [Static SQL]", () => {
  it("migration file exists and contains valid SQL definitions", () => {
    expect(fs.existsSync(MIGRATION_PATH)).toBe(true);
    const content = getMigrationSQL();
    expect(content.length).toBeGreaterThan(1000);
  });

  it("creates all 5 required enum types", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("CREATE TYPE public.draw_status");
    expect(sql).toContain("CREATE TYPE public.draw_mode");
    expect(sql).toContain("CREATE TYPE public.match_tier");
    expect(sql).toContain("CREATE TYPE public.winner_verification_status");
    expect(sql).toContain("CREATE TYPE public.winner_payout_status");
  });

  it("draw_status enum defines draft, simulated, published, and cancelled", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("'draft'");
    expect(sql).toContain("'simulated'");
    expect(sql).toContain("'published'");
    expect(sql).toContain("'cancelled'");
  });

  it("draw_mode enum defines random and algorithmic", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("'random'");
    expect(sql).toContain("'algorithmic'");
  });

  it("match_tier enum defines 5_number, 4_number, and 3_number", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("'5_number'");
    expect(sql).toContain("'4_number'");
    expect(sql).toContain("'3_number'");
  });

  it("creates public.draws table with required columns", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("CREATE TABLE public.draws");
    expect(sql).toContain("draw_number");
    expect(sql).toContain("month");
    expect(sql).toContain("draw_mode");
    expect(sql).toContain("status");
    expect(sql).toContain("winning_numbers");
    expect(sql).toContain("jackpot_rollover_in");
    expect(sql).toContain("jackpot_rollover_out");
  });

  it("creates public.draw_tier_allocations with pool percentage check constraint", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("CREATE TABLE public.draw_tier_allocations");
    expect(sql).toContain("chk_pool_percentage CHECK (pool_percentage IN (40.00, 35.00, 25.00))");
    expect(sql).toContain("CONSTRAINT uq_draw_tier UNIQUE (draw_id, tier)");
  });

  it("creates public.draw_entries table with unique user per draw constraint", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("CREATE TABLE public.draw_entries");
    expect(sql).toContain("CONSTRAINT uq_draw_user_entry UNIQUE (draw_id, user_id)");
  });

  it("creates public.winners table with composite unique constraint", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("CREATE TABLE public.winners");
    expect(sql).toContain("CONSTRAINT uq_winner_match UNIQUE (draw_id, user_id, match_tier)");
  });

  it("enforces RLS on all 4 draw tables", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;");
    expect(sql).toContain("ALTER TABLE public.draw_tier_allocations ENABLE ROW LEVEL SECURITY;");
    expect(sql).toContain("ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;");
    expect(sql).toContain("ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;");
  });

  it("creates public read policy for published draws only", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("public_read_published_draws");
    expect(sql).toContain("status = 'published'");
  });

  it("creates admin manage policies for all 4 tables", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("admins_manage_draws");
    expect(sql).toContain("admins_manage_tier_allocations");
    expect(sql).toContain("admins_read_all_entries");
    expect(sql).toContain("admins_manage_winners");
  });

  it("creates subscriber isolation policy for draw_entries and winners", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("subscribers_read_own_entries");
    expect(sql).toContain("winners_read_own_records");
    expect(sql).toContain("auth.uid() = user_id");
  });

  it("creates enforce_published_draw_immutability trigger", () => {
    const sql = getMigrationSQL();
    expect(sql).toContain("enforce_published_draw_immutability");
    expect(sql).toContain("Published draws are immutable");
    expect(sql).toContain("trg_draws_immutability");
  });
});

// ===========================================================================
// SECTION 2: Pure Matching & Tier Arithmetic [Unit / Deterministic]
// ===========================================================================

describe("Phase 5 — Pure Draw Matching Engine [Unit]", () => {
  it("calculates exact 5-number match count", () => {
    const ticket = [10, 20, 30, 40, 50];
    const winning = [10, 20, 30, 40, 50];
    expect(calculateMatchCount(ticket, winning)).toBe(5);
  });

  it("calculates unordered 5-number match correctly", () => {
    const ticket = [50, 40, 30, 20, 10];
    const winning = [10, 20, 30, 40, 50];
    expect(calculateMatchCount(ticket, winning)).toBe(5);
  });

  it("calculates 4-number match correctly", () => {
    const ticket = [10, 20, 30, 40, 99];
    const winning = [10, 20, 30, 40, 50];
    expect(calculateMatchCount(ticket, winning)).toBe(4);
  });

  it("calculates 3-number match correctly", () => {
    const ticket = [10, 20, 30, 88, 99];
    const winning = [10, 20, 30, 40, 50];
    expect(calculateMatchCount(ticket, winning)).toBe(3);
  });

  it("calculates 2-number match as 2 (sub-tier)", () => {
    const ticket = [10, 20, 77, 88, 99];
    const winning = [10, 20, 30, 40, 50];
    expect(calculateMatchCount(ticket, winning)).toBe(2);
  });

  it("returns 0 matches when none coincide", () => {
    const ticket = [1, 2, 3, 4, 5];
    const winning = [10, 20, 30, 40, 50];
    expect(calculateMatchCount(ticket, winning)).toBe(0);
  });

  it("gracefully handles empty arrays", () => {
    expect(calculateMatchCount([], [1, 2, 3])).toBe(0);
    expect(calculateMatchCount([1, 2, 3], [])).toBe(0);
  });

  it("maps match counts to PRD statutory tiers", () => {
    expect(determineMatchTier(5)).toBe("5_number");
    expect(determineMatchTier(6)).toBe("5_number"); // 5 or more
    expect(determineMatchTier(4)).toBe("4_number");
    expect(determineMatchTier(3)).toBe("3_number");
    expect(determineMatchTier(2)).toBeNull();
    expect(determineMatchTier(1)).toBeNull();
    expect(determineMatchTier(0)).toBeNull();
  });

  it("statutory pool shares reflect PRD § 07 exactly (40%, 35%, 25%)", () => {
    const shares = getTierPoolShares();
    expect(shares["5_number"]).toBe(40.0);
    expect(shares["4_number"]).toBe(35.0);
    expect(shares["3_number"]).toBe(25.0);
    expect(shares["5_number"] + shares["4_number"] + shares["3_number"]).toBe(100.0);
  });

  it("splits tier prize equally among multiple winners with integer cents safety", () => {
    const split2 = calculateEqualTierSplit(1000, 2);
    expect(split2.prizePerWinner).toBe(500);
    expect(split2.remainder).toBe(0);

    const split3 = calculateEqualTierSplit(1000, 3);
    // $1000 / 3 = $333.33 with $0.01 remainder
    expect(split3.prizePerWinner).toBe(333.33);
    expect(split3.remainder).toBe(0.01);
  });

  it("handles 0 winners gracefully without division by zero", () => {
    const split = calculateEqualTierSplit(1000, 0);
    expect(split.prizePerWinner).toBe(0);
    expect(split.remainder).toBe(0);
  });
});

// ===========================================================================
// SECTION 3: Strategy Interface Contracts [Contract]
// ===========================================================================

describe("Phase 5 — Strategy Interface Contracts [Contract]", () => {
  it("IDrawExecutionStrategy contract can be implemented without assumptions", async () => {
    const mockRandomStrategy: IDrawExecutionStrategy = {
      mode: "random",
      async generateWinningNumbers(ctx) {
        return [7, 14, 21, 28, 35];
      },
    };
    expect(mockRandomStrategy.mode).toBe("random");
    const numbers = await mockRandomStrategy.generateWinningNumbers({
      drawId: "d1",
      month: "2026-10-01",
      mode: "random",
    });
    expect(numbers).toHaveLength(5);
  });

  it("IScoreToTicketMapper decouples score conversion", () => {
    // Demonstrates that ticket mapping is pluggable and independent of business rules
    const identityMapper: IScoreToTicketMapper = {
      mapScoresToTicket(scores) {
        return scores;
      },
    };
    expect(identityMapper.mapScoresToTicket([32, 34, 36, 38, 40])).toEqual([32, 34, 36, 38, 40]);
  });

  it("IDrawEligibilityResolver decouples eligibility rules", () => {
    const strictFiveResolver: IDrawEligibilityResolver = {
      isEligible(count, active) {
        return active && count === 5;
      },
    };
    expect(strictFiveResolver.isEligible(5, true)).toBe(true);
    expect(strictFiveResolver.isEligible(4, true)).toBe(false);
    expect(strictFiveResolver.isEligible(5, false)).toBe(false);
  });

  it("IPrizePoolCalculator decouples prize pool calculations", () => {
    const testCalculator: IPrizePoolCalculator = {
      calculatePool(count, rate = 10) {
        const grossPool = count * rate * 0.2; // 20% test fixture only
        return {
          grossPool,
          tierAllocations: {
            "5_number": { percentage: 40, amount: grossPool * 0.4 },
            "4_number": { percentage: 35, amount: grossPool * 0.35 },
            "3_number": { percentage: 25, amount: grossPool * 0.25 },
          },
        };
      },
    };
    const res = testCalculator.calculatePool(100, 10);
    expect(res.grossPool).toBe(200);
    expect(res.tierAllocations["5_number"].amount).toBe(80);
    expect(res.tierAllocations["4_number"].amount).toBe(70);
    expect(res.tierAllocations["3_number"].amount).toBe(50);
  });
});
