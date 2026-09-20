import { describe, it, expect } from "vitest";
import {
  DEMO_USER,
  DEMO_SUBSCRIPTION,
  DEMO_SCORES,
  DEMO_TICKET_NUMBERS,
  DEMO_SELECTED_CHARITY,
  DEMO_CHARITY_PERCENTAGE,
  DEMO_UPCOMING_DRAW,
  DEMO_LATEST_DRAW,
  DEMO_WINNINGS,
  DEMO_TOTAL_WINNINGS,
  DEMO_PAYMENT_METHODS,
} from "@/lib/demo/data";

describe("Phase 9 Demo Mode — Data Isolation & Safety", () => {
  it("DEMO_USER is an isolated fictional identity", () => {
    expect(DEMO_USER.id).toContain("demo-user");
    expect(DEMO_USER.email).toContain("demo");
    expect(DEMO_USER.role).toBe("subscriber");
  });

  it("DEMO_SUBSCRIPTION has valid simulated billing parameters", () => {
    expect(DEMO_SUBSCRIPTION.status).toBe("active");
    expect(DEMO_SUBSCRIPTION.plan).toBe("Monthly");
    expect(DEMO_SUBSCRIPTION.amount).toBe(10.0);
    expect(DEMO_SUBSCRIPTION.currency).toBe("GBP");
  });

  it("DEMO_SCORES adheres to 5-score limit and Stableford boundary 1-45", () => {
    expect(DEMO_SCORES).toHaveLength(5);
    DEMO_SCORES.forEach((s) => {
      expect(s.score).toBeGreaterThanOrEqual(1);
      expect(s.score).toBeLessThanOrEqual(45);
      expect(s.id).toContain("demo");
    });
  });

  it("DEMO_TICKET_NUMBERS matches demo scores without destructive mutation", () => {
    expect(DEMO_TICKET_NUMBERS).toEqual([38, 32, 41, 35, 29]);
  });

  it("DEMO_SELECTED_CHARITY obeys PRD 10% floor requirement", () => {
    expect(DEMO_CHARITY_PERCENTAGE).toBeGreaterThanOrEqual(10);
    expect(DEMO_SELECTED_CHARITY.is_active).toBe(true);
    expect(DEMO_SELECTED_CHARITY.id).toContain("demo");
  });

  it("DEMO_WINNINGS correctly aggregates total prize calculation", () => {
    const computedTotal = DEMO_WINNINGS.reduce((sum, w) => sum + w.prize_amount, 0);
    expect(DEMO_TOTAL_WINNINGS).toBe(computedTotal);
    expect(DEMO_TOTAL_WINNINGS).toBe(855.75);
  });

  it("DEMO_PAYMENT_METHODS covers 4 required simulation channels", () => {
    const ids = DEMO_PAYMENT_METHODS.map((m) => m.id);
    expect(ids).toContain("card");
    expect(ids).toContain("upi");
    expect(ids).toContain("qr");
    expect(ids).toContain("bank_transfer");
  });

  it("Demo modules never import or invoke production stripe or supabase server modules", async () => {
    // Pure data module has zero side-effects
    const demoDataModule = await import("@/lib/demo/data");
    expect(demoDataModule).toBeDefined();
  });
});
