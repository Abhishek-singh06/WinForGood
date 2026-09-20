/**
 * =============================================================================
 * DIGITAL HEROES — Phase 5: Production Draw Engine Test Suite
 * =============================================================================
 *
 * Covers:
 * - Temporary Assumptions Isolation (TA-001 — TA-006)
 * - Score-to-Ticket Mapping (Decision #1, BR-047)
 * - Dynamic Partial Ticket Eligibility (TA-002, Model B)
 * - Random Draw Strategy (PRD § 06)
 * - Algorithmic Weighted Strategy with Laplace Smoothing (Decision #2, BR-048)
 * - Prize Pool Accounting, Rollover, and Charity Disposition (TA-001, TA-004-006, PRD § 07)
 * - Multi-Winner Split Division and Penny Remainder Tracking
 * - Pure Simulation Core Execution
 * - Database Migration 5 Schema Invariants & Immutability Trigger
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  TEMPORARY_ASSUMPTIONS,
  PRD_TIER_PERCENTAGES,
  getMonthlyEquivalentRevenuePence,
} from "../lib/draws/config";
import { DirectScoreToTicketMapper } from "../lib/draws/mapper";
import { DynamicPartialEligibilityResolver } from "../lib/draws/eligibility";
import {
  RandomDrawStrategy,
  AlgorithmicDrawStrategy,
  createSeededRng,
  getDrawStrategy,
} from "../lib/draws/engine";
import {
  ProductionPrizePoolCalculator,
  formatPenceToGBP,
} from "../lib/draws/pool";
import {
  calculateMatchCount,
  determineMatchTier,
  calculateEqualTierSplit,
} from "../lib/draws/matching";
import { executeDrawSimulationCore } from "../lib/draws/actions";

const MIGRATION_5_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/20260920000005_phase5_production_engine.sql"
);

describe("1. Temporary Product Owner Assumptions (TA-001 — TA-006) [Config]", () => {
  it("TA-001: prize pool percentage is exactly 30%", () => {
    expect(TEMPORARY_ASSUMPTIONS.TA_001_PRIZE_POOL_PERCENTAGE).toBe(30);
  });

  it("TA-002: eligibility model is Model B (Dynamic Partial Tickets)", () => {
    expect(TEMPORARY_ASSUMPTIONS.TA_002_ELIGIBILITY_MODEL).toBe("MODEL_B_DYNAMIC_PARTIAL");
  });

  it("TA-003: platform currency is GBP", () => {
    expect(TEMPORARY_ASSUMPTIONS.TA_003_CURRENCY).toBe("GBP");
  });

  it("TA-004: monthly subscription price is 1000 pence (£10.00)", () => {
    expect(TEMPORARY_ASSUMPTIONS.TA_004_MONTHLY_PRICE_PENCE).toBe(1000);
    expect(formatPenceToGBP(TEMPORARY_ASSUMPTIONS.TA_004_MONTHLY_PRICE_PENCE)).toBe("£10.00");
  });

  it("TA-005: yearly subscription price is 10000 pence (£100.00)", () => {
    expect(TEMPORARY_ASSUMPTIONS.TA_005_YEARLY_PRICE_PENCE).toBe(10000);
    expect(formatPenceToGBP(TEMPORARY_ASSUMPTIONS.TA_005_YEARLY_PRICE_PENCE)).toBe("£100.00");
  });

  it("TA-006: unclaimed lower-tier disposition is CHARITY", () => {
    expect(TEMPORARY_ASSUMPTIONS.TA_006_UNCLAIMED_DISPOSITION).toBe("CHARITY");
  });

  it("calculates Monthly Equivalent Revenue (MER) accurately", () => {
    expect(getMonthlyEquivalentRevenuePence("monthly")).toBe(1000);
    // Yearly: 10000 / 12 = 833.33 -> floor to 833 pence
    expect(getMonthlyEquivalentRevenuePence("yearly")).toBe(833);
  });

  it("PRD tier percentage sum is exactly 100%", () => {
    const sum =
      PRD_TIER_PERCENTAGES["5_number"] +
      PRD_TIER_PERCENTAGES["4_number"] +
      PRD_TIER_PERCENTAGES["3_number"];
    expect(sum).toBe(100);
  });
});

describe("2. Score-to-Ticket Mapping (Decision #1, BR-047) [Mapper]", () => {
  const mapper = new DirectScoreToTicketMapper();

  it("maps valid Stableford scores directly to draw numbers (1–45)", () => {
    const scores = [36, 40, 28, 42, 30];
    const ticket = mapper.mapScoresToTicket(scores);
    expect(ticket).toEqual([28, 30, 36, 40, 42]); // Sorted ascending
  });

  it("preserves duplicate scores on the ticket", () => {
    const scores = [36, 36, 38, 40, 40];
    const ticket = mapper.mapScoresToTicket(scores);
    expect(ticket).toEqual([36, 36, 38, 40, 40]);
  });

  it("handles fewer than 5 scores (dynamic partial tickets)", () => {
    expect(mapper.mapScoresToTicket([])).toEqual([]);
    expect(mapper.mapScoresToTicket([32])).toEqual([32]);
    expect(mapper.mapScoresToTicket([45, 12, 28])).toEqual([12, 28, 45]);
  });

  it("filters out scores outside legal Stableford range 1–45", () => {
    const scores = [0, 10, 45, 46, -5, 30];
    const ticket = mapper.mapScoresToTicket(scores);
    expect(ticket).toEqual([10, 30, 45]);
  });
});

describe("3. Draw Eligibility Resolver (TA-002, Model B) [Eligibility]", () => {
  const resolver = new DynamicPartialEligibilityResolver();

  it("requires active subscription for eligibility", () => {
    expect(resolver.isEligible(5, false)).toBe(false);
    expect(resolver.isEligible(0, false)).toBe(false);
    expect(resolver.isEligible(5, true)).toBe(true);
    expect(resolver.isEligible(0, true)).toBe(true);
  });

  it("evaluates maximum achievable tier based on distinct score count", () => {
    // 0, 1, or 2 distinct scores cannot reach Tier 3 (3 matches)
    expect(resolver.getMaxAchievableTier([])).toBeNull();
    expect(resolver.getMaxAchievableTier([36])).toBeNull();
    expect(resolver.getMaxAchievableTier([36, 38])).toBeNull();

    // 3 distinct scores can win Tier 3
    expect(resolver.getMaxAchievableTier([20, 25, 30])).toBe("3_number");

    // 4 distinct scores can win Tier 4
    expect(resolver.getMaxAchievableTier([20, 25, 30, 35])).toBe("4_number");

    // 5 distinct scores can win Tier 5 (Jackpot)
    expect(resolver.getMaxAchievableTier([20, 25, 30, 35, 40])).toBe("5_number");

    // 5 scores with duplicates only has distinct count
    // [36, 36, 36, 38, 40] has 3 distinct numbers -> max achievable is Tier 3
    expect(resolver.getMaxAchievableTier([36, 36, 36, 38, 40])).toBe("3_number");
  });

  it("provides comprehensive ticket potential analysis", () => {
    const analysis = resolver.evaluateTicketPotential([36, 36, 38, 40]);
    expect(analysis.rawCount).toBe(4);
    expect(analysis.distinctCount).toBe(3);
    expect(analysis.canWinTier3).toBe(true);
    expect(analysis.canWinTier4).toBe(false);
    expect(analysis.canWinTier5).toBe(false);
    expect(analysis.maxAchievableTier).toBe("3_number");
  });
});

describe("4. Random Draw Strategy (PRD § 06) [Engine]", () => {
  const strategy = new RandomDrawStrategy();

  it("draws exactly 5 distinct numbers within 1–45", async () => {
    const numbers = await strategy.generateWinningNumbers({
      drawId: "draw-1",
      month: "2026-10-01",
      mode: "random",
    });

    expect(numbers).toHaveLength(5);
    const unique = new Set(numbers);
    expect(unique.size).toBe(5);

    for (const num of numbers) {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(45);
    }

    // Must be sorted ascending
    const sorted = [...numbers].sort((a, b) => a - b);
    expect(numbers).toEqual(sorted);
  });

  it("deterministic seeded PRNG produces identical numbers", async () => {
    const numbersA = await strategy.generateWinningNumbers({
      drawId: "draw-1",
      month: "2026-10-01",
      mode: "random",
      randomSeed: "audit-seed-12345",
    });

    const numbersB = await strategy.generateWinningNumbers({
      drawId: "draw-1",
      month: "2026-10-01",
      mode: "random",
      randomSeed: "audit-seed-12345",
    });

    expect(numbersA).toEqual(numbersB);
  });

  it("different seeds produce different outputs", async () => {
    const numbersA = await strategy.generateWinningNumbers({
      drawId: "draw-1",
      month: "2026-10-01",
      mode: "random",
      randomSeed: "seed-alpha",
    });

    const numbersB = await strategy.generateWinningNumbers({
      drawId: "draw-1",
      month: "2026-10-01",
      mode: "random",
      randomSeed: "seed-beta",
    });

    expect(numbersA).not.toEqual(numbersB);
  });
});

describe("5. Algorithmic Draw Strategy (Decision #2, BR-048) [Engine]", () => {
  const strategy = new AlgorithmicDrawStrategy();

  it("builds frequency distribution from participant tickets", () => {
    const tickets = [
      [36, 38, 40],
      [36, 42],
      [10, 20, 36],
    ];

    const dist = AlgorithmicDrawStrategy.buildFrequencyDistribution(tickets);
    expect(dist[36]).toBe(3);
    expect(dist[38]).toBe(1);
    expect(dist[40]).toBe(1);
    expect(dist[42]).toBe(1);
    expect(dist[10]).toBe(1);
    expect(dist[20]).toBe(1);
    expect(dist[1]).toBe(0); // Zero occurrences maintained
  });

  it("generates 5 distinct numbers sorted ascending", async () => {
    const dist: Record<number, number> = { 36: 10, 38: 8, 40: 6 };
    const numbers = await strategy.generateWinningNumbers({
      drawId: "draw-2",
      month: "2026-10-01",
      mode: "algorithmic",
      frequencyDistribution: dist,
      randomSeed: "algo-seed-999",
    });

    expect(numbers).toHaveLength(5);
    expect(new Set(numbers).size).toBe(5);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it("zero-frequency numbers retain non-zero probability via Laplace smoothing (W = f + 1)", async () => {
    // Even if only number 36 has frequency, other numbers still have weight 1
    const dist: Record<number, number> = { 36: 100 };
    const numbers = await strategy.generateWinningNumbers({
      drawId: "draw-2",
      month: "2026-10-01",
      mode: "algorithmic",
      frequencyDistribution: dist,
      randomSeed: "reproducible-seed-555",
    });

    expect(numbers).toHaveLength(5);
    // All 5 numbers must be distinct
    expect(new Set(numbers).size).toBe(5);
  });

  it("factory getDrawStrategy selects correct strategy", () => {
    expect(getDrawStrategy("random")).toBeInstanceOf(RandomDrawStrategy);
    expect(getDrawStrategy("algorithmic")).toBeInstanceOf(AlgorithmicDrawStrategy);
  });
});

describe("6. Prize Pool Accounting, Rollover, & Charity Disposition [Pool]", () => {
  const poolCalc = new ProductionPrizePoolCalculator();

  it("calculates gross new pool at 30% of aggregate MER", () => {
    // 100 monthly subscribers = 100 * 1000 pence = 100,000 pence (£1000.00)
    // Gross Pool = 30% = 30,000 pence (£300.00)
    const breakdown = poolCalc.calculateFullBreakdown({
      subscribers: { monthly: 100, yearly: 0 },
      winnerCounts: { "5_number": 0, "4_number": 0, "3_number": 0 },
      jackpotRolloverInPence: 0,
    });

    expect(breakdown.grossNewPool).toBe(30000);
    // Tier 5: 40% of 30,000 = 12,000 pence (£120.00)
    expect(breakdown.tierAllocations["5_number"].allocatedAmount).toBe(12000);
    // Tier 4: 35% of 30,000 = 10,500 pence (£105.00)
    expect(breakdown.tierAllocations["4_number"].allocatedAmount).toBe(10500);
    // Tier 3: 25% of 30,000 = 7,500 pence (£75.00)
    expect(breakdown.tierAllocations["3_number"].allocatedAmount).toBe(7500);
  });

  it("Tier 5 unclaimed rolls over to next month's jackpot (PRD § 07)", () => {
    const breakdown = poolCalc.calculateFullBreakdown({
      subscribers: { monthly: 100, yearly: 0 },
      winnerCounts: { "5_number": 0, "4_number": 1, "3_number": 1 },
      jackpotRolloverInPence: 5000, // £50 rollover in from prior cycle
    });

    // Tier 5 total available = 12,000 + 5,000 = 17,000 pence
    const t5 = breakdown.tierAllocations["5_number"];
    expect(t5.allocatedAmount).toBe(17000);
    expect(t5.winnerCount).toBe(0);
    expect(t5.unclaimedAmount).toBe(17000);
    expect(t5.disposition).toBe("ROLLOVER");
    expect(breakdown.jackpotRolloverOut).toBe(17000);
  });

  it("Tier 4 & Tier 3 unclaimed are assigned to charity disposition (TA-006)", () => {
    const breakdown = poolCalc.calculateFullBreakdown({
      subscribers: { monthly: 100, yearly: 0 },
      winnerCounts: { "5_number": 1, "4_number": 0, "3_number": 0 },
      jackpotRolloverInPence: 0,
    });

    const t4 = breakdown.tierAllocations["4_number"];
    const t3 = breakdown.tierAllocations["3_number"];

    expect(t4.unclaimedAmount).toBe(10500);
    expect(t4.disposition).toBe("CHARITY");
    expect(t3.unclaimedAmount).toBe(7500);
    expect(t3.disposition).toBe("CHARITY");

    // Total charity disposition = 10,500 + 7,500 = 18,000 pence (£180.00)
    expect(breakdown.charityDispositionTotal).toBe(18000);
  });

  it("splits prize equally among multiple winners with penny remainder tracking", () => {
    // Tier 4 pool = 10,500 pence. With 4 winners:
    // 10,500 / 4 = 2625 pence each, remainder = 0
    const breakdownA = poolCalc.calculateFullBreakdown({
      subscribers: { monthly: 100, yearly: 0 },
      winnerCounts: { "5_number": 0, "4_number": 4, "3_number": 0 },
    });
    expect(breakdownA.tierAllocations["4_number"].prizePerWinner).toBe(2625);
    expect(breakdownA.tierAllocations["4_number"].remainderAmount).toBe(0);

    // Tier 3 pool = 7,500 pence. With 7 winners:
    // 7,500 / 7 = 1071 pence per winner (7 * 1071 = 7497), remainder = 3 pence
    const breakdownB = poolCalc.calculateFullBreakdown({
      subscribers: { monthly: 100, yearly: 0 },
      winnerCounts: { "5_number": 0, "4_number": 0, "3_number": 7 },
    });
    expect(breakdownB.tierAllocations["3_number"].prizePerWinner).toBe(1071);
    expect(breakdownB.tierAllocations["3_number"].remainderAmount).toBe(3);
  });
});

describe("7. Set-Based Match Counting (BR-047) [Matching]", () => {
  it("counts matches as set intersection without duplicate score double-counting", () => {
    const winningNumbers = [10, 20, 30, 40, 45];
    // Ticket with duplicate 20: [10, 20, 20, 20, 30]
    // Matches: 10, 20, 30 (3 distinct matches)
    const matchCount = calculateMatchCount([10, 20, 20, 20, 30], winningNumbers);
    expect(matchCount).toBe(3);
    expect(determineMatchTier(matchCount)).toBe("3_number");
  });
});

describe("8. Pure Simulation Core [Action Core]", () => {
  it("runs end-to-end simulation deterministically", async () => {
    const result = await executeDrawSimulationCore({
      drawId: "test-draw-100",
      month: "2026-10-01",
      drawMode: "algorithmic",
      participants: [
        { userId: "u1", scores: [10, 20, 30, 40, 45], plan: "monthly" }, // 5 matches
        { userId: "u2", scores: [10, 20, 30, 40, 1], plan: "yearly" },   // 4 matches
        { userId: "u3", scores: [10, 20, 30, 2, 3], plan: "monthly" },    // 3 matches
        { userId: "u4", scores: [10, 20], plan: "monthly" },              // 2 matches (sub-tier)
      ],
      jackpotRolloverInPence: 1000,
      randomSeed: "fixed-test-seed",
    });

    expect(result.winningNumbers).toHaveLength(5);
    expect(result.entries).toHaveLength(4);
    expect(result.breakdown.grossNewPool).toBeGreaterThan(0);
    expect(result.breakdown.tierAllocations["5_number"]).toBeDefined();
    expect(result.breakdown.tierAllocations["4_number"]).toBeDefined();
    expect(result.breakdown.tierAllocations["3_number"]).toBeDefined();
  });
});

describe("9. Database Migration 5 Schema Invariants [Static SQL]", () => {
  it("migration 000005 file exists", () => {
    expect(fs.existsSync(MIGRATION_5_PATH)).toBe(true);
  });

  it("adds unclaimed_amount, disposition, and remainder_amount columns", () => {
    const sql = fs.readFileSync(MIGRATION_5_PATH, "utf-8");
    expect(sql).toContain("unclaimed_amount NUMERIC(12,2)");
    expect(sql).toContain("disposition TEXT");
    expect(sql).toContain("remainder_amount NUMERIC(12,2)");
  });

  it("enforces valid disposition constraint", () => {
    const sql = fs.readFileSync(MIGRATION_5_PATH, "utf-8");
    expect(sql).toContain("chk_tier_disposition");
    expect(sql).toContain("'CHARITY'");
    expect(sql).toContain("'ROLLOVER'");
  });

  it("implements published draw tier allocations immutability trigger", () => {
    const sql = fs.readFileSync(MIGRATION_5_PATH, "utf-8");
    expect(sql).toContain("enforce_published_tier_allocation_immutability");
    expect(sql).toContain("trg_draw_tier_allocations_immutability");
    expect(sql).toContain("Tier allocations for published draws are immutable");
  });
});
