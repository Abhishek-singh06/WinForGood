import { describe, it, expect } from "vitest";
import { CHARITIES } from "../lib/data/charities";

describe("Charity Data Integrity & PRD Compliance", () => {
  it("should have at least 3 active charities for directory and spotlight", () => {
    expect(CHARITIES.length).toBeGreaterThanOrEqual(3);
  });

  it("should have at least one featured charity for the homepage spotlight (PRD § 08.2)", () => {
    const featured = CHARITIES.filter((c) => c.isFeatured);
    expect(featured.length).toBeGreaterThanOrEqual(1);
  });

  it("should have valid mission, description, and impact metrics for each charity", () => {
    for (const charity of CHARITIES) {
      expect(charity.name).toBeTruthy();
      expect(charity.slug).toBeTruthy();
      expect(charity.mission.length).toBeGreaterThan(20);
      expect(charity.impactMetrics.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("should have golf day events for partner engagement (PRD § 08.2)", () => {
    const hasEvents = CHARITIES.some((c) => c.events.length > 0);
    expect(hasEvents).toBe(true);
  });
});
