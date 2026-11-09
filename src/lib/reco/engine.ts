import type {
  Cafe, Caffeine, CheckIn, Drink, Needs, Offer, Plan, Preferences, Profile, RecoCard, RecoContext, SwipeAction,
} from "./types";

const CAF_ORDER: Caffeine[] = ["decaf", "light", "regular", "high"];
const DAY = 86_400_000;
export const WALK_M_PER_MIN = 80;
export const RADIUS_M = { "5": 400, "15": 1200, trip: 3000 } as const;

const MOOD = {
  cozy: { temp: "hot", tags: ["warm", "spiced", "chocolate", "nutty"], sweetness: "any" },
  refreshing: { temp: "iced", tags: ["bright", "citrus", "tonic", "light"], sweetness: "any" },
  indulgent: { temp: "any", tags: ["sweet", "creamy", "seasonal", "specialty"], sweetness: "high" },
  clean: { temp: "any", tags: ["black", "espresso", "pour-over"], sweetness: "low" },
} as const;

export const PLAN_TAGS = {
  grab: ["fast service", "takeout"],
  work: ["wifi", "outlets", "seating", "quiet", "laptop-friendly"],
  catchup: ["seating", "groups", "cozy"],
  treat: ["specialty", "aesthetic", "pastries", "high rating"],
} as const;

// STEP 1
export function deriveNeeds(p: Profile, c: CheckIn, ctx: RecoContext): Needs {
  let caffeine: Caffeine = c.battery <= 33 ? "high" : c.battery <= 66 ? "regular" : "light";
  if (p.caffeineSensitive && caffeine === "high") caffeine = "regular";
  if (ctx.localMinutes >= 15 * 60 && CAF_ORDER.indexOf(caffeine) > 1) caffeine = "light";

  const m = MOOD[c.mood];
  let temp: Needs["temp"] = m.temp;
  if (temp === "any") {
    if ((ctx.tempF ?? 60) > 75) temp = "iced";
    else if ((ctx.tempF ?? 60) < 50 || ctx.raining) temp = "hot";
  }
  return {
    caffeine,
    temp,
    flavorTags: [...m.tags],
    sweetness: m.sweetness,
    requiredTags: [...PLAN_TAGS[c.plan]],
    radiusM: Math.round(RADIUS_M[c.distance] * (p.radiusScale || 1)),
  };
}

export function distanceM(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (bLat - aLat) * r, dLng = (bLng - aLng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// STEP 2
export function passesHardFilters(cafe: Cafe, p: Profile, c: CheckIn, ctx: RecoContext, needs: Needs) {
  const t = ctx.localMinutes;
  if (t < cafe.openMin || t >= cafe.closeMin - 30) return false;
  if (distanceM(ctx.lat, ctx.lng, cafe.lat, cafe.lng) > needs.radiusM) return false;
  if (cafe.priceLevel > p.budget + (c.plan === "treat" ? 1 : 0)) return false;
  if (cafe.rating < 4.0 || cafe.reviews < 50) return false;
  for (const ps of p.passes) {
    if (ps.cafeId !== cafe.id) continue;
    const age = ctx.now - ps.at;
    if (ps.reason === "been" ? age < 7 * DAY : age < 3 * DAY) return false;
  }
  if (p.needsNonDairy && cafe.noNonDairy) return false;
  return true;
}

// STEP 3
export function drinkFit(d: Drink, n: Needs) {
  const diff = Math.abs(CAF_ORDER.indexOf(d.caffeine) - CAF_ORDER.indexOf(n.caffeine));
  const caf = diff === 0 ? 1 : diff === 1 ? 0.5 : 0;
  const temp = n.temp === "any" || d.temp === "both" || d.temp === n.temp ? 1 : 0;
  const flav = n.flavorTags.length ? d.tags.filter((t) => n.flavorTags.includes(t)).length / Math.min(2, n.flavorTags.length) : 1;
  const sweet = n.sweetness === "any" ? 1 : n.sweetness === "low" ? (d.sweetness <= 1 ? 1 : 0) : d.sweetness >= 2 ? 1 : 0;
  return (caf + temp + Math.min(1, flav) + sweet) / 4;
}

export function scoreCafe(cafe: Cafe, p: Profile, n: Needs, ctx: RecoContext) {
  const tags = new Set(cafe.tags);
  if (cafe.rating >= 4.6) tags.add("high rating");
  const cafeFit = n.requiredTags.filter((t) => tags.has(t)).length / n.requiredTags.length;
  const best = [...cafe.drinks].sort((a, b) => drinkFit(b, n) - drinkFit(a, n))[0]!;
  const dFit = drinkFit(best, n);
  const histTags = [...cafe.tags, ...best.tags];
  const sum = histTags.reduce((s, t) => s + (p.tagWeights[t] ?? 0), 0);
  const history = (Math.max(-1, Math.min(1, sum / (5 * Math.max(1, histTags.length) / 2))) + 1) / 2;
  const dist = distanceM(ctx.lat, ctx.lng, cafe.lat, cafe.lng);
  const quality = Math.max(0, Math.min(1, (cafe.rating - 4) / 1));
  const close = Math.max(0, 1 - dist / n.radiusM);
  const score = 100 * (0.35 * cafeFit + 0.35 * dFit + 0.2 * history + 0.1 * (0.5 * quality + 0.5 * close));
  return { score, best, dist };
}

export interface Candidate { cafe: Cafe; score: number; best: Drink; dist: number; wildcard: boolean; unseen: boolean }

// STEP 5
export function selectDiverse(sorted: Candidate[], adventurous: boolean, size = 8): Candidate[] {
  const wildNeeded = adventurous ? 2 : 1;
  const chainCount: Record<string, number> = {};
  const okChain = (c: Candidate) => !c.cafe.chain || (chainCount[c.cafe.chain] ?? 0) < 2;
  const take = (c: Candidate) => { if (c.cafe.chain) chainCount[c.cafe.chain] = (chainCount[c.cafe.chain] ?? 0) + 1; };

  // Prefer wildcards that wouldn't already make the list on score alone.
  const cutoff = size - wildNeeded;
  const wildPool = [...sorted.slice(cutoff), ...sorted.slice(0, cutoff)].filter((c) => c.wildcard);
  const wild: Candidate[] = [];
  for (const c of wildPool) {
    if (wild.length >= wildNeeded) break;
    if (okChain(c)) { wild.push(c); take(c); }
  }
  const main: Candidate[] = [];
  for (const c of sorted) {
    if (main.length >= size - wild.length) break;
    if (wild.includes(c) || !okChain(c)) continue;
    main.push(c); take(c);
  }
  const out = [...main];
  if (wild[0]) out.splice(Math.min(2, out.length), 0, wild[0]);
  if (wild[1]) out.splice(Math.min(5, out.length), 0, wild[1]);

  if (!out.some((c) => c.unseen)) {
    const fresh = sorted.find((c) => c.unseen && !out.includes(c));
    if (fresh) {
      for (let i = out.length - 1; i >= 0; i--) {
        if (!wild.includes(out[i]!) && (!fresh.cafe.chain || out[i]!.cafe.chain === fresh.cafe.chain || (chainCount[fresh.cafe.chain] ?? 0) < 2)) { out[i] = fresh; break; }
      }
    }
  }
  return out.slice(0, size).map((c) => ({ ...c, wildcard: wild.includes(c) }));
}

export function rankCandidates(cafes: Cafe[], p: Profile, c: CheckIn, ctx: RecoContext, n: Needs): Candidate[] {
  return cafes
    .filter((cafe) => passesHardFilters(cafe, p, c, ctx, n))
    .map((cafe) => {
      const s = scoreCafe(cafe, p, n, ctx);
      if (cafe.promoted) s.score += PROMOTED_BOOST;
      const unseen = !p.seenCafeIds.includes(cafe.id);
      return { cafe, ...s, unseen, wildcard: unseen || cafe.drinks.some((d) => d.unusual) };
    })
    .sort((a, b) => b.score - a.score);
}

export function toCards(list: Candidate[]): RecoCard[] {
  const top = Math.max(...list.map((c) => c.score), 1);
  return list.map((c) => ({
    cafeId: c.cafe.id,
    name: c.cafe.name,
    neighborhood: c.cafe.neighborhood,
    distanceM: Math.round(c.dist),
    walkMin: Math.max(1, Math.round(c.dist / WALK_M_PER_MIN)),
    match: Math.round((c.score / top) * 96),
    rawScore: Math.round(c.score * 10) / 10,
    heroDrink: c.best.name,
    heroLine: `Locals love the ${c.best.name.toLowerCase()}`,
    why: "",
    cafeTags: c.cafe.tags,
    drinkTags: c.best.tags,
    wildcard: c.wildcard,
    priceLevel: c.cafe.priceLevel,
    rating: c.cafe.rating,
    promoted: !!c.cafe.promoted,
    offer: null,
    reviewSnippets: c.cafe.reviewSnippets,
    drinks: c.cafe.drinks.map((d) => d.name),
    hours: `${fmtMin(c.cafe.openMin)}–${fmtMin(c.cafe.closeMin)}`,
  }));
}

// STEP 6
const clamp = (v: number) => Math.max(-5, Math.min(5, v));
export function applySwipe(p: Profile, card: Pick<RecoCard, "cafeId" | "cafeTags" | "drinkTags">, action: SwipeAction, now = Date.now()): Profile {
  const w = { ...p.tagWeights };
  const bump = (tags: string[], d: number) => tags.forEach((t) => (w[t] = clamp((w[t] ?? 0) + d)));
  const next: Profile = { ...p, tagWeights: w, seenCafeIds: Array.from(new Set([...p.seenCafeIds, card.cafeId])) };
  switch (action) {
    case "heart": bump(card.cafeTags, 1); bump(card.drinkTags, 1); break;
    case "heartDrink": bump(card.drinkTags, 2); break;
    case "heartVibe": bump(card.cafeTags, 2); break;
    case "goNow": bump([...card.cafeTags, ...card.drinkTags], 3); break;
    case "passVibe": bump(card.cafeTags, -1); next.passes = [...p.passes, { cafeId: card.cafeId, reason: "vibe", at: now }]; break;
    case "passDrink": bump(card.drinkTags, -1); next.passes = [...p.passes, { cafeId: card.cafeId, reason: "drink", at: now }]; break;
    case "passFar": next.radiusScale = (p.radiusScale || 1) * 0.9; next.passes = [...p.passes, { cafeId: card.cafeId, reason: "far", at: now }]; break;
    case "passBeen": next.passes = [...p.passes, { cafeId: card.cafeId, reason: "been", at: now }]; break;
  }
  return next;
}

// MONETIZATION
export const PROMOTED_BOOST = 4; // score points (out of 100) — small nudge, never bypasses hard filters
export const PAID_MATCH_USD = 0.5;

export function fmtMin(m: number) {
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return `${((h + 11) % 12) + 1}${mm ? ":" + String(mm).padStart(2, "0") : ""}${h < 12 ? "am" : "pm"}`;
}

export function activeOffer(cafe: Pick<Cafe, "offers">, plan: Plan, localMinutes: number): Offer | null {
  return cafe.offers?.find((o) => o.purposes.includes(plan) && localMinutes >= o.startMin && localMinutes < o.endMin) ?? null;
}

/** Revenue owed for a match: only promoted cafés bill. */
export function paidMatchFee(card: Pick<RecoCard, "promoted">) {
  return card.promoted ? PAID_MATCH_USD : 0;
}

// PREFERENCES (rule baseline the AI refines with free text)
export function basePreferences(p: Profile, c: CheckIn, ctx: RecoContext, n: Needs): Preferences {
  const plan = c.plan;
  return {
    purpose: plan,
    duration: plan === "work" ? c.duration ?? "2-3h" : null,
    energy: c.battery <= 33 ? "low" : c.battery <= 66 ? "medium" : "high",
    mood: c.mood,
    social_battery: c.battery,
    temperature: n.temp === "iced" ? "iced" : "hot",
    flavor_tags: n.flavorTags,
    caffeine_level: n.caffeine,
    noise: plan === "work" ? "quiet" : plan === "catchup" ? "moderate" : "lively",
    needs_outlets: plan === "work",
    needs_wifi: plan === "work",
    drink: p.usualOrder && p.usualOrder !== "Surprise me" ? p.usualOrder : null,
    budget: p.budget,
    radius_minutes: Math.round(n.radiusM / WALK_M_PER_MIN),
  };
}

/** Fold (possibly AI-edited) preferences back into needs, keeping safety guardrails. */
export function applyPreferences(p: Profile, n: Needs, pref: Preferences, ctx: RecoContext): Needs {
  let caffeine = pref.caffeine_level;
  if (p.caffeineSensitive && caffeine === "high") caffeine = "regular";
  if (ctx.localMinutes >= 15 * 60 && CAF_ORDER.indexOf(caffeine) > 1) caffeine = "light";
  const req = new Set(n.requiredTags);
  if (pref.needs_wifi) req.add("wifi");
  if (pref.needs_outlets) req.add("outlets");
  if (pref.noise === "quiet") req.add("quiet"); else req.delete("quiet");
  return {
    ...n,
    caffeine,
    temp: pref.temperature,
    flavorTags: pref.flavor_tags.length ? pref.flavor_tags : n.flavorTags,
    requiredTags: [...req],
    radiusM: Math.max(200, Math.min(4000, Math.round(pref.radius_minutes * WALK_M_PER_MIN))),
  };
}
