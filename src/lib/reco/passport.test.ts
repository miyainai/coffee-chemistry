import { describe, expect, it } from "vitest";
import { activeDeals, applyRating, badges, pendingYesterday, stamps, startOfDay } from "./passport";
import { demoHistory } from "./seed";
import { CAFES, DEFAULT_LOCATION } from "./cafes";
import type { Profile } from "./types";

const P: Profile = { budget: 4, caffeineSensitive: false, needsNonDairy: false, radiusScale: 1, tagWeights: {}, passes: [], seenCafeIds: [] };
const NOW = startOfDay(Date.now()) + 14.5 * 3_600_000;
const ctx = (m: number) => ({ now: NOW, localMinutes: m, ...DEFAULT_LOCATION });

describe("passport + deals", () => {
  it("keeps demo visit hours across daylight-saving transitions", () => {
    for (const now of [new Date(2026, 10, 8, 14, 30), new Date(2026, 2, 15, 14, 30)]) {
      const history = demoHistory(now.getTime());
      expect(history.slice(0, 4).map((entry) => new Date(entry.at).getHours())).toEqual([15, 7, 13, 7]);
      expect(badges(history).find((badge) => badge.id === "early")?.unlocked).toBe(true);
    }
  });
  it("demo seed: yesterday's match awaits a rating", () => {
    expect(pendingYesterday(demoHistory(NOW), NOW)?.card.cafeId).toBe("c3");
  });
  it("matches from today or 2+ days ago don't prompt", () => {
    const h = demoHistory(NOW).filter((e) => e.card.cafeId !== "c3");
    expect(pendingYesterday(h, NOW)).toBeNull();
  });
  it("demo seed: 3 stamps and 4 of 6 badges", () => {
    const h = demoHistory(NOW);
    expect(stamps(h, CAFES)).toHaveLength(3);
    expect(badges(h).filter((b) => b.unlocked).map((b) => b.id)).toEqual(["first", "explorer", "early", "ride"]);
  });
  it("rating yesterday unlocks a 4th stamp and Neighborhood Hopper", () => {
    const h = demoHistory(NOW).map((e) => (e.rating ? e : { ...e, rating: "loved" as const }));
    expect(stamps(h, CAFES)).toHaveLength(4);
    expect(badges(h).find((b) => b.id === "hopper")?.unlocked).toBe(true);
  });
  it("'I didn't make it' doesn't count as a visit", () => {
    const h = demoHistory(NOW).map((e) => (e.rating ? e : { ...e, rating: "skipped" as const }));
    expect(stamps(h, CAFES)).toHaveLength(3);
  });
  it("deals within a 3 km trip: 1 at 2:30pm, 2 at 4pm, none at 8am", () => {
    expect(activeDeals(CAFES, P, ctx(14 * 60 + 30))).toHaveLength(1);
    expect(activeDeals(CAFES, P, ctx(16 * 60))).toHaveLength(2);
    expect(activeDeals(CAFES, P, ctx(8 * 60))).toHaveLength(0);
  });
  it("loved the drink boosts drink tags; too loud boosts quiet", () => {
    const card = { cafeTags: ["cozy"], drinkTags: ["creamy"] };
    expect(applyRating(P, card, "loved", ["The drink"]).tagWeights).toEqual({ creamy: 2 });
    expect(applyRating(P, card, "meh", ["Too loud"]).tagWeights["quiet"]).toBe(1);
  });
});
