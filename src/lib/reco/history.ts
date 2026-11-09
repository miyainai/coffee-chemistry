import type { Mood, Plan, RecoCard } from "./types";

export interface MatchEntry {
  card: RecoCard;
  at: number;
  plan?: Plan | undefined;
  mood?: Mood | undefined;
  iced?: boolean | undefined;
  rating?: "loved" | "fine" | "meh" | "skipped" | undefined;
  chips?: string[] | undefined;
}

export function saveHistory(h: MatchEntry[]) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }

export const HISTORY_KEY = "cc-history";

export function loadHistory(): MatchEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
export function addToHistory(e: MatchEntry) {
  const next = [e, ...loadHistory()];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export interface HistoryFilter {
  plan?: Plan | "all";
  mood?: Mood | "all";
  neighborhood?: string | "all";
  maxPrice?: number | undefined;
  maxWalk?: number | undefined;
  offersOnly?: boolean;
  sort?: "recent" | "match" | "visits";
}

/** Count how many times each café was matched. */
export function visitCounts(h: MatchEntry[]) {
  const m: Record<string, number> = {};
  for (const e of h) m[e.card.cafeId] = (m[e.card.cafeId] ?? 0) + 1;
  return m;
}

export function filterHistory(h: MatchEntry[], f: HistoryFilter): MatchEntry[] {
  const counts = visitCounts(h);
  const out = h.filter((e) =>
    (!f.plan || f.plan === "all" || e.plan === f.plan) &&
    (!f.mood || f.mood === "all" || e.mood === f.mood) &&
    (!f.neighborhood || f.neighborhood === "all" || e.card.neighborhood === f.neighborhood) &&
    (f.maxPrice == null || e.card.priceLevel <= f.maxPrice) &&
    (f.maxWalk == null || e.card.walkMin <= f.maxWalk) &&
    (!f.offersOnly || !!e.card.offer));
  const s = f.sort ?? "recent";
  return [...out].sort((a, b) =>
    s === "match" ? b.card.match - a.card.match :
    s === "visits" ? (counts[b.card.cafeId]! - counts[a.card.cafeId]!) || b.at - a.at :
    b.at - a.at);
}
