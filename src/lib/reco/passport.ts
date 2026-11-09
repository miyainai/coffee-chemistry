import type { Cafe, CheckIn, Profile, RecoCard, RecoContext } from "./types";
import type { MatchEntry } from "./history";
import { deriveNeeds, distanceM, RADIUS_M, scoreCafe, toCards } from "./engine";

export type Rating = "loved" | "fine" | "meh" | "skipped";
export const HIT_CHIPS = ["The drink", "The vibe", "Wi-Fi/outlets", "The crowd", "The price"] as const;
export const MISS_CHIPS = ["The drink", "Too loud", "Too crowded", "No seats", "Too pricey"] as const;

const DAY = 86_400_000;
export function startOfDay(t: number) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }

/** Most recent unrated match from yesterday (local time), if any. */
export function pendingYesterday(h: MatchEntry[], now = Date.now()): MatchEntry | null {
  const today = startOfDay(now);
  return h.filter((e) => !e.rating && e.at < today && e.at >= today - DAY).sort((a, b) => b.at - a.at)[0] ?? null;
}

/** A match only counts as a visit once it's rated as visited. */
export const visits = (h: MatchEntry[]) => h.filter((e) => e.rating && e.rating !== "skipped");

const clamp = (v: number) => Math.max(-5, Math.min(5, v));
/** Update taste weights from a rating + chips. */
export function applyRating(p: Profile, card: Pick<RecoCard, "cafeTags" | "drinkTags">, rating: Rating, chips: string[]): Profile {
  const w = { ...p.tagWeights };
  const bump = (tags: string[], d: number) => tags.forEach((t) => (w[t] = clamp((w[t] ?? 0) + d)));
  if (rating === "loved") {
    if (chips.includes("The drink")) bump(card.drinkTags, 2);
    if (chips.includes("The vibe")) bump(card.cafeTags, 2);
    if (chips.includes("Wi-Fi/outlets")) bump(["wifi", "outlets"], 2);
    if (chips.includes("The crowd")) bump(["groups"], 1);
    if (chips.includes("The price")) bump(["cheap"], 1);
    if (!chips.length) { bump(card.drinkTags, 1); bump(card.cafeTags, 1); }
  } else if (rating === "meh") {
    if (chips.includes("The drink")) bump(card.drinkTags, -2);
    if (chips.includes("Too loud")) { bump(["quiet"], 1); bump(["lively", "groups"], -1); }
    if (chips.includes("Too crowded")) bump(["groups"], -1);
    if (chips.includes("No seats")) bump(["seating"], 2);
    if (chips.includes("Too pricey")) bump(["cheap"], 2);
    if (!chips.length) { bump(card.drinkTags, -1); bump(card.cafeTags, -1); }
  }
  return { ...p, tagWeights: w };
}

export interface Badge { id: string; emoji: string; name: string; hint: string; progress: number; goal: number; unlocked: boolean }
export function badges(h: MatchEntry[]): Badge[] {
  const v = visits(h);
  const unique = new Set(v.map((e) => e.card.cafeId)).size;
  const early = v.filter((e) => new Date(e.at).getHours() < 8).length;
  const counts: Record<string, number> = {};
  v.forEach((e) => (counts[e.card.cafeId] = (counts[e.card.cafeId] ?? 0) + 1));
  const same = Math.max(0, ...Object.values(counts));
  const iced = v.filter((e) => e.iced).length;
  const hoods = new Set(v.map((e) => e.card.neighborhood)).size;
  const b = (id: string, emoji: string, name: string, hint: string, progress: number, goal: number): Badge =>
    ({ id, emoji, name, hint, progress: Math.min(progress, goal), goal, unlocked: progress >= goal });
  return [
    b("first", "☕", "First Sip", "Visit your first café", v.length, 1),
    b("explorer", "🧭", "Explorer", "Try 5 different cafés", unique, 5),
    b("early", "🌅", "Early Bird", "3 visits before 8 AM", early, 3),
    b("ride", "💛", "Ride or Die", "Same café 5 times", same, 5),
    b("iced", "🧊", "Iced Out", "Order 10 iced drinks", iced, 10),
    b("hopper", "🗺️", "Neighborhood Hopper", "Cafés in 4 neighborhoods", hoods, 4),
  ];
}

export interface Stamp { neighborhood: string; explored: number; total: number }
/** One stamp per neighborhood you've visited, with cafés explored out of all cafés there. */
export function stamps(h: MatchEntry[], cafes: Pick<Cafe, "id" | "neighborhood">[]): Stamp[] {
  const v = visits(h);
  const hoods = Array.from(new Set(v.map((e) => e.card.neighborhood)));
  return hoods.map((n) => ({
    neighborhood: n,
    explored: new Set(v.filter((e) => e.card.neighborhood === n).map((e) => e.card.cafeId)).size,
    total: cafes.filter((c) => c.neighborhood === n).length,
  }));
}

export interface Deal { card: RecoCard; endsAt: number }
/** Active offers (any purpose) within the usual 15-min radius, at the given local time. */
export function activeDeals(cafes: Cafe[], p: Profile, ctx: RecoContext): Deal[] {
  const radius = RADIUS_M.trip * (p.radiusScale || 1);
  const out: Deal[] = [];
  for (const cafe of cafes) {
    const offer = cafe.offers?.find((o) => ctx.localMinutes >= o.startMin && ctx.localMinutes < o.endMin);
    if (!offer || distanceM(ctx.lat, ctx.lng, cafe.lat, cafe.lng) > radius) continue;
    if (ctx.localMinutes < cafe.openMin || ctx.localMinutes >= cafe.closeMin) continue;
    const c: CheckIn = { battery: 50, mood: "clean", plan: offer.purposes[0] ?? "grab", distance: "15" };
    const s = scoreCafe(cafe, p, deriveNeeds(p, c, ctx), ctx);
    const [card] = toCards([{ cafe, ...s, wildcard: false, unseen: false }]);
    // toCards normalises to the top score; with one card use the raw score instead.
    out.push({ card: { ...card!, match: Math.round(Math.min(96, s.score)), offer }, endsAt: offer.endMin });
  }
  return out.sort((a, b) => b.card.match - a.card.match);
}

export function fmtCountdown(mins: number) {
  if (mins <= 0) return "Ending now";
  const h = Math.floor(mins / 60), m = Math.floor(mins % 60);
  return `Ends in ${h ? `${h}h ` : ""}${m}m`;
}
