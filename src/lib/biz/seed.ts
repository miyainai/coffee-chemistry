import { CAFES } from "@/lib/reco/cafes";
import type { Offer } from "@/lib/reco/types";
import { AVG_TICKET_USD, cafeRevenue, cafeSpend, roiMultiple, MATCH_FEE_USD, VISIT_FEE_USD, PRO_PRICE_USD } from "./economics";

// Deterministic demo activity for the business dashboards (Boston cafés).
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

export const PASS_REASONS = ["Too pricey", "Too loud", "Too far", "Not my vibe", "Not that drink"] as const;

export interface ShopStats {
  id: string; name: string; neighborhood: string; promoted: boolean; pro: boolean;
  views: number; matches: number; promotedMatches: number; visits: number; returned: number; newCustomers: number;
  revenue: number; spend: number; roi: number;
  passes: { reason: string; count: number }[];
  segments: { label: string; count: number }[];
  hits: string[]; misses: string[];
  offers: (Offer & { redemptions: number; cost: number; revenue: number; seats: number })[];
  weekly: { week: string; matches: number; visits: number }[];
}

const WEAK = new Set([3, 9]); // a couple of underperformers with lots of "too pricey" passes

export const SHOPS: ShopStats[] = CAFES.slice(0, 15).map((c, i) => {
  const r = rng(i + 7);
  const weak = WEAK.has(i);
  const views = Math.round(1800 + r() * 2600);
  const matchRate = weak ? 0.05 + r() * 0.03 : 0.12 + r() * 0.08;
  const matches = Math.round(views * matchRate);
  const visits = Math.round(matches * (weak ? 0.22 : 0.38 + r() * 0.15));
  const returned = Math.round(visits * (weak ? 0.15 : 0.3 + r() * 0.2));
  const promoted = !!c.promoted || i % 4 === 1;
  const pro = i % 3 === 0;
  const promotedMatches = promoted ? matches : 0;
  const revenue = cafeRevenue(visits);
  const spend = cafeSpend({ promotedMatches, visits, pro });
  const passTotal = views - matches;
  const w = weak ? [0.48, 0.1, 0.14, 0.16, 0.12] : [0.12 + r() * 0.1, 0.1 + r() * 0.12, 0.25, 0.22, 0.15];
  const ws = w.reduce((a, b) => a + b, 0);
  const offers = (c.offers ?? []).map((o, k) => {
    const redemptions = Math.round(20 + r() * 60);
    return { ...o, redemptions, cost: redemptions * 2, revenue: redemptions * AVG_TICKET_USD * 1.4, seats: Math.round(redemptions * 0.7 + k) };
  });
  return {
    id: c.id, name: c.name, neighborhood: c.neighborhood, promoted, pro,
    views, matches, promotedMatches, visits, returned, newCustomers: Math.round(visits * 0.62),
    revenue, spend, roi: roiMultiple(revenue, spend),
    passes: PASS_REASONS.map((reason, k) => ({ reason, count: Math.round(passTotal * 0.35 * (w[k]! / ws)) })),
    segments: [
      { label: "First-timers", count: Math.round(visits * 0.62) },
      { label: "Regulars", count: returned },
      { label: "Lapsed regulars", count: Math.round(returned * 0.3) },
      { label: "Laptop workers", count: Math.round(visits * (c.tags.includes("outlets") ? 0.45 : 0.18)) },
      { label: "Social groups", count: Math.round(visits * (c.tags.includes("groups") ? 0.35 : 0.15)) },
    ],
    hits: weak ? ["The drink", "The vibe"] : ["The drink", "Wi-Fi & outlets", "The vibe"],
    misses: weak ? ["Too pricey", "No seats"] : ["Too crowded", "Too loud"],
    offers,
    weekly: Array.from({ length: 8 }, (_, k) => ({ week: `W${k + 1}`, matches: Math.round((matches / 4) * (0.7 + k * 0.06 + r() * 0.1)), visits: Math.round((visits / 4) * (0.7 + k * 0.06)) })),
  };
});

export const DEMAND = [
  { time: "8 AM", purpose: "Grab & go", mood: "Clean & simple", drink: "Hot americano" },
  { time: "12 PM", purpose: "Catch up", mood: "Refreshing", drink: "Iced latte" },
  { time: "3 PM", purpose: "Lock in & work", mood: "Cozy", drink: "Half-caf oat latte" },
  { time: "6 PM", purpose: "Treat myself", mood: "Indulgent", drink: "Mocha / decaf" },
];

export function neighborhoodAvg(hood: string) {
  const g = SHOPS.filter((s) => s.neighborhood === hood);
  const list = g.length > 1 ? g : SHOPS;
  const sum = (f: (s: ShopStats) => number) => list.reduce((a, s) => a + f(s), 0);
  return { matched: sum((s) => s.matches) / sum((s) => s.views), visited: sum((s) => s.visits) / sum((s) => s.matches), returned: sum((s) => s.returned) / sum((s) => s.visits) };
}

// Platform view: 8 weeks of revenue by stream across all seeded cafés.
export const PLATFORM_WEEKS = Array.from({ length: 8 }, (_, k) => {
  const f = 0.6 + k * 0.08;
  const m = SHOPS.reduce((a, s) => a + s.promotedMatches / 4, 0) * f;
  const v = SHOPS.reduce((a, s) => a + s.visits / 4, 0) * f;
  const pro = SHOPS.filter((s) => s.pro).length;
  return { week: `W${k + 1}`, promoted: Math.round(m * MATCH_FEE_USD), visits: Math.round(v * VISIT_FEE_USD), pro: Math.round((pro * PRO_PRICE_USD) / 4.33) };
});
