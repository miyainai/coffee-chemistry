import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CAFES } from "./cafes";
import { activeOffer, applyPreferences, basePreferences, deriveNeeds, rankCandidates, selectDiverse, toCards } from "./engine";
import type { CheckIn, Preferences, Profile, RecoContext } from "./types";

const schema = z.object({
  profile: z.object({
    budget: z.number().min(1).max(4),
    caffeineSensitive: z.boolean(),
    needsNonDairy: z.boolean(),
    radiusScale: z.number().min(0.1).max(1),
    tagWeights: z.record(z.number()),
    passes: z.array(z.object({ cafeId: z.string(), reason: z.enum(["vibe", "drink", "far", "been"]), at: z.number() })).max(500),
    seenCafeIds: z.array(z.string()).max(500),
    milk: z.enum(["whole", "oat", "almond", "black"]).optional(),
    usualOrder: z.string().max(40).optional(),
    caffeineTolerance: z.enum(["sensitive", "normal", "high"]).optional(),
  }),
  checkin: z.object({
    battery: z.number().min(0).max(100),
    mood: z.enum(["cozy", "refreshing", "indulgent", "clean"]),
    plan: z.enum(["grab", "work", "catchup", "treat"]),
    distance: z.enum(["5", "15", "trip"]),
    note: z.string().max(300).optional(),
    adventurous: z.boolean().optional(),
    duration: z.enum(["1h", "2-3h", "allday"]).optional(),
  }),
  ctx: z.object({
    now: z.number(), localMinutes: z.number().min(0).max(1440),
    tempF: z.number().optional(), raining: z.boolean().optional(),
    lat: z.number(), lng: z.number(),
  }),
});

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data }) => {
    const profile = data.profile as Profile;
    const checkin = data.checkin as CheckIn;
    const ctx = data.ctx as RecoContext;
    const { refinePreferences, writeCardCopy } = await import("./ai.server");

    const baseNeeds = deriveNeeds(profile, checkin, ctx);
    let prefs: Preferences = basePreferences(profile, checkin, ctx, baseNeeds);
    const ai = await refinePreferences({ checkin, profile: { milk: profile.milk, usualOrder: profile.usualOrder, caffeineTolerance: profile.caffeineTolerance, budget: profile.budget }, localTime: `${Math.floor(ctx.localMinutes / 60)}:${String(ctx.localMinutes % 60).padStart(2, "0")}` }, prefs);
    if (ai) prefs = sanitize(ai, prefs);
    const needs = applyPreferences(profile, baseNeeds, prefs, ctx);
    const p2 = { ...profile, budget: prefs.budget };

    const ranked = rankCandidates(CAFES, p2, checkin, ctx, needs);
    const picked = selectDiverse(ranked.slice(0, Math.max(10, 10)).concat(ranked.slice(10)), !!checkin.adventurous);
    const cards = toCards(picked);

    const copy = await writeCardCopy(checkin, picked.map((c) => ({
      cafeId: c.cafe.id, name: c.cafe.name, tags: c.cafe.tags,
      drinks: c.cafe.drinks.map((d) => d.name), reviews: c.cafe.reviewSnippets,
    })));
    for (const card of cards) {
      const a = copy?.find((x) => x.cafeId === card.cafeId);
      const cafe = picked.find((p) => p.cafe.id === card.cafeId)!.cafe;
      const drink = a && cafe.drinks.find((d) => d.name.toLowerCase() === a.heroDrink?.toLowerCase());
      if (drink) { card.heroDrink = drink.name; card.drinkTags = drink.tags; card.heroLine = a!.heroLine || card.heroLine; }
      card.offer = activeOffer(cafe, checkin.plan, ctx.localMinutes);
      card.why = a?.why?.split(/\s+/).slice(0, 20).join(" ") || `Fits your ${checkin.plan === "work" ? "work block" : "plan"} with ${card.cafeTags.slice(0, 2).join(" and ")}.`;
    }
    return { needs, prefs, cards };
  });

function sanitize(raw: Record<string, unknown>, base: Preferences): Preferences {
  const r = raw as Partial<Record<keyof Preferences, unknown>>;
  const pick = <T extends string>(v: unknown, opts: readonly T[], d: T): T => (opts.includes(v as T) ? (v as T) : d);
  return {
    purpose: base.purpose,
    duration: base.duration,
    energy: pick(r.energy, ["low", "medium", "high"] as const, base.energy),
    mood: base.mood,
    social_battery: base.social_battery,
    temperature: pick(r.temperature, ["hot", "iced"] as const, base.temperature),
    flavor_tags: Array.isArray(r.flavor_tags) ? r.flavor_tags.map(String).slice(0, 6) : base.flavor_tags,
    caffeine_level: pick(r.caffeine_level, ["decaf", "light", "regular", "high"] as const, base.caffeine_level),
    noise: pick(r.noise, ["quiet", "moderate", "lively"] as const, base.noise),
    needs_outlets: typeof r.needs_outlets === "boolean" ? r.needs_outlets : base.needs_outlets,
    needs_wifi: typeof r.needs_wifi === "boolean" ? r.needs_wifi : base.needs_wifi,
    drink: typeof r.drink === "string" ? r.drink.slice(0, 40) : base.drink,
    budget: typeof r.budget === "number" ? Math.max(1, Math.min(4, Math.round(r.budget))) : base.budget,
    radius_minutes: typeof r.radius_minutes === "number" ? Math.max(3, Math.min(50, r.radius_minutes)) : base.radius_minutes,
  };
}

export const baristaChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    cafeId: z.string().max(20),
    matchedDrink: z.string().max(80),
    profile: z.object({ milk: z.string().max(10).optional(), usualOrder: z.string().max(40).optional(), caffeineTolerance: z.string().max(12).optional(), budget: z.number().optional() }),
    messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1000) })).min(1).max(40),
  }).parse(d))
  .handler(async ({ data }) => {
    const cafe = CAFES.find((c) => c.id === data.cafeId);
    if (!cafe) throw new Error("Café not found");
    const { baristaReply } = await import("./ai.server");
    try {
      return { reply: await baristaReply(cafe, data.matchedDrink, data.profile, data.messages) };
    } catch (e) {
      console.error("barista chat failed", e);
      return { reply: null as string | null, error: "The barista stepped away for a sec. Try again in a moment." };
    }
  });
