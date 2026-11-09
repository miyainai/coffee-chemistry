import { describe, expect, it } from "vitest";
import { cafeRevenue, cafeSpend, roiMultiple, monthlyRevenue, ltvCac, DEFAULT_ASSUMPTIONS } from "./economics";

describe("business economics", () => {
  it("revenue generated = verified visits × $7", () => expect(cafeRevenue(100)).toBe(700));
  it("spend = $0.50/promoted match + $1.50/visit + $79 Pro", () =>
    expect(cafeSpend({ promotedMatches: 100, visits: 40, pro: true })).toBe(50 + 60 + 79));
  it("ROI multiple is revenue / spend", () => expect(roiMultiple(620, 100)).toBeCloseTo(6.2));
  it("monthly revenue scales with paying cafés", () => {
    const a = DEFAULT_ASSUMPTIONS;
    expect(monthlyRevenue({ ...a, pctPaying: 0 })).toBe(0);
    expect(monthlyRevenue({ ...a, cafes: a.cafes * 2 })).toBeCloseTo(monthlyRevenue(a) * 2);
  });
  it("default scenario is above 3x LTV:CAC", () => expect(ltvCac(DEFAULT_ASSUMPTIONS)).toBeGreaterThan(3));
});
