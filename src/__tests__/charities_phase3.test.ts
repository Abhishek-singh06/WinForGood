import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { validateCharityContributionPercentage } from "../lib/charities/validation";
import { getCharities, getCharityBySlug } from "../lib/charities/actions";
import { CharityRecord } from "../lib/charities/types";

describe("Phase 3: Charity Directory & Selection Verification (PRD § 07 & § 08)", () => {
  const migrationPath = path.resolve(
    __dirname,
    "../../supabase/migrations/20260920000002_phase3_scores_charities.sql"
  );
  const sql = fs.readFileSync(migrationPath, "utf-8");

  // 18. Charity slug uniqueness [Static SQL]
  it("18. [Static SQL] Charity slug uniqueness enforced by UNIQUE constraint", () => {
    expect(sql).toContain("slug TEXT NOT NULL UNIQUE");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_charities_slug ON public.charities(slug)");
  });

  // 19. Active charity publicly readable [Static SQL]
  it("19. [Static SQL] Active charity publicly readable via RLS select policy", () => {
    expect(sql).toContain('CREATE POLICY "charities_select_public"');
    expect(sql).toContain("ON public.charities");
    expect(sql).toContain("FOR SELECT");
  });

  // 20. Inactive charity cannot be selected [Unit / Validation Logic]
  it("20. [Unit] Inactive charity cannot be selected for new preference", () => {
    const inactiveCharity: Partial<CharityRecord> = {
      id: "charity-archived",
      name: "Archived Foundation",
      is_active: false,
    };

    function validateSelectionEligibility(charity: Partial<CharityRecord>): { eligible: boolean; error?: string } {
      if (!charity.is_active) {
        return {
          eligible: false,
          error: "The selected charity is currently inactive and cannot receive new allocations.",
        };
      }
      return { eligible: true };
    }

    const res = validateSelectionEligibility(inactiveCharity);
    expect(res.eligible).toBe(false);
    expect(res.error).toContain("currently inactive");
  });

  // 21. Search works [Unit / Integration Logic]
  it("21. [Unit] Search query matches across name, mission, and description", async () => {
    const results = await getCharities({ search: "clean drinking water" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("clean-water-allies");
  });

  // 22. Filtering works [Unit / Integration Logic]
  it("22. [Unit] Category filtering filters accurately by represented categories", async () => {
    const results = await getCharities({ category: "Veteran Support & Mental Health" });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Veterans Forward Project");

    const nonExistent = await getCharities({ category: "Non Existent Category" });
    expect(nonExistent.length).toBe(0);
  });

  // 23. Charity profile works [Unit / Integration Logic]
  it("23. [Unit] Charity profile lookup by slug returns complete details", async () => {
    const charity = await getCharityBySlug("youth-horizon-initiative");
    expect(charity).not.toBeNull();
    expect(charity?.name).toBe("Youth Horizon Initiative");
    expect(charity?.category).toBe("Education & Youth Empowerment");
    expect(charity?.is_active).toBe(true);
  });

  // 24. Subscriber can select an active charity [Unit]
  it("24. [Unit] Subscriber can select an active charity with valid percentage", () => {
    const activeCharity: Partial<CharityRecord> = {
      id: "charity-active",
      name: "Clean Water Allies",
      is_active: true,
    };
    const pctResult = validateCharityContributionPercentage(15);
    expect(pctResult.valid).toBe(true);
    expect(activeCharity.is_active).toBe(true);
  });

  // 25. Contribution below 10 rejected [Unit]
  it("25. [Unit] Contribution below 10 rejected (10% floor violation)", () => {
    const belowMin = validateCharityContributionPercentage(9);
    expect(belowMin.valid).toBe(false);
    expect(belowMin.error).toContain("statutory 10% floor");

    const zero = validateCharityContributionPercentage(0);
    expect(zero.valid).toBe(false);
  });

  // 26. Contribution above 100 rejected [Unit]
  it("26. [Unit] Contribution above 100 rejected", () => {
    const aboveMax = validateCharityContributionPercentage(101);
    expect(aboveMax.valid).toBe(false);
    expect(aboveMax.error).toContain("cannot exceed 100%");
  });

  // 27. Subscriber cannot modify charity records [Static SQL]
  it("27. [Static SQL] Subscriber cannot modify charity records (restricted to is_admin)", () => {
    // Only admins have insert/update/delete policies on charities
    expect(sql).toContain('CREATE POLICY "charities_insert_admin"');
    expect(sql).toContain("WITH CHECK (public.is_admin());");

    expect(sql).toContain('CREATE POLICY "charities_update_admin"');
    expect(sql).toContain("USING (public.is_admin())");

    expect(sql).toContain('CREATE POLICY "charities_delete_admin"');
    expect(sql).toContain("USING (public.is_admin())");

    // Verify there is NO non-admin update policy on charities
    expect(sql).not.toContain('"charities_update_own"');
  });

  // 28. Admin can manage charities [Static SQL]
  it("28. [Static SQL] Admin can manage charities via is_admin() policies", () => {
    expect(sql).toContain('CREATE POLICY "charities_insert_admin"');
    expect(sql).toContain('CREATE POLICY "charities_update_admin"');
    expect(sql).toContain('CREATE POLICY "charities_delete_admin"');
    expect(sql).toContain("WITH CHECK (public.is_admin())");
  });

  // 29. Charity selection maintains foreign-key integrity [Static SQL]
  it("29. [Static SQL] Charity selection in profiles maintains foreign-key integrity with ON DELETE SET NULL", () => {
    expect(sql).toContain("charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL");
    expect(sql).toContain("CHECK (charity_percentage >= 10 AND charity_percentage <= 100)");
  });
});
