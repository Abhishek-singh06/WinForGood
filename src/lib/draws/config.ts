/**
 * =============================================================================
 * DIGITAL HEROES — Phase 5: Temporary Product Owner Assumptions Configuration
 * =============================================================================
 *
 * IMPORTANT DISCLAIMER:
 * These values are TEMPORARY PRODUCT OWNER IMPLEMENTATION ASSUMPTIONS.
 * They are NOT claimed to come from the Digital Heroes PRD (Level 1).pdf.
 *
 * They exist solely to enable end-to-end implementation and verification
 * of the Phase 5 Draw Engine and Prize Pool accounting while formal commercial
 * decisions are pending from the Product Owner.
 *
 * All parameters are strictly isolated in this configuration module so they can
 * be replaced later without requiring rewrites of the draw engine architecture.
 *
 * TEMPORARY ASSUMPTION REGISTRY:
 * - TA-001: Prize Pool Contribution Percentage = 30% of Monthly Equivalent Revenue (MER)
 * - TA-002: Draw Eligibility Model = Model B: Dynamic Partial Tickets (0–5 retained scores enter)
 * - TA-003: Platform Currency = GBP (£)
 * - TA-004: Monthly Subscription Price = £10.00 (1000 pence)
 * - TA-005: Yearly Subscription Price = £100.00 (10000 pence, ~16.67% discount)
 * - TA-006: Lower-Tier (3 & 4 Match) Unclaimed Funds Disposition = Model B: Charity Disposition
 * =============================================================================
 */

export const TEMPORARY_ASSUMPTIONS = {
  /**
   * TA-001: Percentage of subscription revenue allocated to the gross prize pool.
   * Value: 30%
   */
  TA_001_PRIZE_POOL_PERCENTAGE: 30,

  /**
   * TA-002: Eligibility model for monthly draw entry.
   * Model B: Dynamic Partial Tickets — all active subscribers participate with
   * however many scores (0–5) they have logged. No synthetic numbers are added.
   */
  TA_002_ELIGIBILITY_MODEL: "MODEL_B_DYNAMIC_PARTIAL" as const,

  /**
   * TA-003: Platform currency code.
   * Value: 'GBP'
   */
  TA_003_CURRENCY: "GBP" as const,

  /**
   * TA-004: Monthly subscription price in integer subunit (pence).
   * Value: 1000 pence (£10.00)
   */
  TA_004_MONTHLY_PRICE_PENCE: 1000,

  /**
   * TA-005: Yearly subscription price in integer subunit (pence).
   * Value: 10000 pence (£100.00, ~16.67% discount)
   */
  TA_005_YEARLY_PRICE_PENCE: 10000,

  /**
   * TA-006: Accounting destination for unclaimed lower-tier prize funds (3 & 4 match).
   * Value: 'CHARITY' (funds transferred to vetted charity donation pool; does not roll over)
   */
  TA_006_UNCLAIMED_DISPOSITION: "CHARITY" as const,
} as const;

export type TemporaryAssumptions = typeof TEMPORARY_ASSUMPTIONS;

/**
 * Tier share breakdown mandated by PRD § 07:
 * - 5-number match: 40% (rolls over if unclaimed)
 * - 4-number match: 35% (does NOT roll over)
 * - 3-number match: 25% (does NOT roll over)
 */
export const PRD_TIER_PERCENTAGES = {
  "5_number": 40,
  "4_number": 35,
  "3_number": 25,
} as const;

/**
 * Helper to compute the Monthly Equivalent Revenue (MER) in pence for a subscription.
 * - Monthly subscription: 1000 pence (£10.00/mo)
 * - Yearly subscription: 10000 pence / 12 months = 833 pence/mo (floored integer pence)
 */
export function getMonthlyEquivalentRevenuePence(plan: "monthly" | "yearly"): number {
  if (plan === "monthly") {
    return TEMPORARY_ASSUMPTIONS.TA_004_MONTHLY_PRICE_PENCE;
  }
  return Math.floor(TEMPORARY_ASSUMPTIONS.TA_005_YEARLY_PRICE_PENCE / 12);
}
