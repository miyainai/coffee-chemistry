import { describe, expect, it } from "vitest";
import { applySwipe, deriveNeeds, passesHardFilters, rankCandidates, selectDiverse } from "./engine";
import { CAFES, DEFAULT_LOCATION } from "./cafes";
import type { CheckIn, Profile, RecoContext } from "./types";

const profile: Profile = { budget: 3, caffeineSensitive: false, needsNonDairy: false, radiusScale: 1, tagWeights: {}, passes: [], seenCafeIds: [] };
const checkin: CheckIn = { battery: 20, mood: "clean", plan: "work", distance: "trip" };
const ctx: RecoContext = { now: Date.now(), localMinutes: 10 * 60, tempF: 60, ...DEFAULT_LOCATION };

describe("needs", () => {
  it("low battery → high caffeine", () => expect(deriveNeeds(profile, checkin, ctx).caffeine).toBe("high"));
  it("caffeine-sensitive caps at regular", () => expect(deriveNeeds({ ...profile, caffeineSensitive: true }, checkin, ctx).caffeine).toBe("regular"));
  it("after 3pm favors half-caf", () => expect(deriveNeeds(profile, checkin, { ...ctx, localMinutes: 16 * 60 }).caffeine).toBe("light"));
  it("15 min = 1200 m", () => expect(deriveNeeds(profile, { ...checkin, distance: "15" }, ctx).radiusM).toBe(1200));
  it("hot weather nudges iced when mood is neutral", () => expect(deriveNeeds(profile, checkin, { ...ctx, tempF: 80 }).temp).toBe("iced"));
  it("mood overrides weather", () => expect(deriveNeeds(profile, { ...checkin, mood: "cozy" }, { ...ctx, tempF: 85 }).temp).toBe("hot"));
});

describe("hard filters", () => {
  const n = deriveNeeds(profile, checkin, ctx);
  const c1 = { ...CAFES.find((c) => c.id === "c4")!, id: "c1", closeMin: 22 * 60, rating: 4.6, reviews: 800, priceLevel: 2 };
  it("drops café closing within 30 min", () => expect(passesHardFilters(c1, profile, checkin, { ...ctx, localMinutes: 21 * 60 + 40 }, n)).toBe(false));
  it("drops rating < 4.0", () => expect(passesHardFilters({ ...c1, rating: 3.8 }, profile, checkin, ctx, n)).toBe(false));
  it("price +1 allowed only for treat", () => {
    const g = { ...c1, priceLevel: 4 };
    expect(passesHardFilters(g, profile, checkin, ctx, n)).toBe(false);
    expect(passesHardFilters(g, profile, { ...checkin, plan: "treat" }, ctx, n)).toBe(true);
  });
  it("hides 'been there' for 7 days", () => {
    const p = { ...profile, passes: [{ cafeId: "c1", reason: "been" as const, at: ctx.now - 5 * 86_400_000 }] };
    expect(passesHardFilters(c1, p, checkin, ctx, n)).toBe(false);
  });
  it("other passes expire after 3 days", () => {
    const p = { ...profile, passes: [{ cafeId: "c1", reason: "vibe" as const, at: ctx.now - 4 * 86_400_000 }] };
    expect(passesHardFilters(c1, p, checkin, ctx, n)).toBe(true);
  });
});

describe("diversity", () => {
  const ranked = rankCandidates(CAFES, { ...profile, seenCafeIds: CAFES.map((c) => c.id).filter((id) => id !== "c2") }, { ...checkin, plan: "grab" }, ctx, deriveNeeds(profile, { ...checkin, plan: "grab" }, ctx));
  it("max 2 of a chain, 8 cards, wildcard at position 3", () => {
    const out = selectDiverse(ranked, false);
    expect(out.length).toBe(8);
    expect(out.filter((c) => c.cafe.chain === "Pavement").length).toBeLessThanOrEqual(2);
    expect(out[2]!.wildcard).toBe(true);
    expect(out.some((c) => c.unseen)).toBe(true);
  });
  it("adventurous adds wildcard at position 6", () => expect(selectDiverse(ranked, true)[5]!.wildcard).toBe(true));
});

describe("swipes", () => {
  const card = { cafeId: "c1", cafeTags: ["wifi"], drinkTags: ["black"] };
  it("go now +3", () => expect(applySwipe(profile, card, "goNow").tagWeights).toEqual({ wifi: 3, black: 3 }));
  it("clamps at +5", () => expect(applySwipe({ ...profile, tagWeights: { wifi: 4 } }, card, "heartVibe").tagWeights["wifi"]).toBe(5));
  it("not that drink keeps café tags", () => expect(applySwipe(profile, card, "passDrink").tagWeights).toEqual({ black: -1 }));
  it("too far shrinks radius 10%", () => expect(applySwipe(profile, card, "passFar").radiusScale).toBeCloseTo(0.9));
});

import { activeOffer, applyPreferences, basePreferences, paidMatchFee, PROMOTED_BOOST } from "./engine";

describe("monetization", () => {
  const c1 = CAFES.find((c) => c.id === "c4")!;
  it("promoted match bills $0.50, organic bills $0", () => {
    expect(paidMatchFee({ promoted: true })).toBe(0.5);
    expect(paidMatchFee({ promoted: false })).toBe(0);
  });
  it("promoted café gets a small boost", () => {
    const n = deriveNeeds(profile, checkin, ctx);
    const r = rankCandidates(CAFES, profile, checkin, ctx, n).find((x) => x.cafe.id === "c4")!;
    const plain = rankCandidates(CAFES.map((c) => ({ ...c, promoted: false })), profile, checkin, ctx, n).find((x) => x.cafe.id === "c4")!;
    expect(r.score - plain.score).toBeCloseTo(PROMOTED_BOOST);
  });
  it("offer shows only in its window and for its purpose", () => {
    expect(activeOffer(c1, "work", 15 * 60)?.code).toBe("BREW04");
    expect(activeOffer(c1, "work", 10 * 60)).toBeNull();
    expect(activeOffer(c1, "grab", 15 * 60)).toBeNull();
  });
});

describe("preferences", () => {
  const n = deriveNeeds(profile, checkin, ctx);
  it("work → wifi, outlets, quiet", () => {
    const p = basePreferences(profile, checkin, ctx, n);
    expect([p.needs_wifi, p.needs_outlets, p.noise]).toEqual([true, true, "quiet"]);
  });
  it("catch up → moderate noise", () => expect(basePreferences(profile, { ...checkin, plan: "catchup" }, ctx, n).noise).toBe("moderate"));
  it("caffeine-sensitive caps AI's high caffeine", () => {
    const p = basePreferences(profile, checkin, ctx, n);
    expect(applyPreferences({ ...profile, caffeineSensitive: true }, n, { ...p, caffeine_level: "high" }, ctx).caffeine).toBe("regular");
  });
});
