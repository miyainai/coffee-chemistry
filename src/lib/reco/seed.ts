import { CAFES } from "./cafes";
import { toCards } from "./engine";
import type { MatchEntry } from "./history";
import { startOfDay } from "./passport";

const SEEDED = "cc-seeded-boston-v2";

function cardFor(id: string, match: number) {
  const cafe = CAFES.find((c) => c.id === id)!;
  const best = cafe.drinks[0]!;
  const [card] = toCards([{ cafe, best, score: 90, dist: 600, wildcard: false, unseen: false }]);
  return { ...card!, match };
}

/** Three weeks of demo history; yesterday's match is left unrated. */
export function demoHistory(now = Date.now()): MatchEntry[] {
  const today = startOfDay(now);
  const at = (daysAgo: number, h: number, m = 0) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(h, m, 0, 0);
    return date.getTime();
  };
  const e = (id: string, daysAgo: number, h: number, iced: boolean, rating: MatchEntry["rating"], plan: MatchEntry["plan"], mood: MatchEntry["mood"], match = 88): MatchEntry =>
    ({ card: cardFor(id, match), at: at(daysAgo, h, 30), iced, rating, plan, mood });
  return [
    e("c3", 1, 15, false, undefined, "treat", "cozy", 84),
    e("c4", 2, 7, false, "loved", "work", "clean", 94),
    e("c8", 3, 13, true, "loved", "treat", "refreshing", 81),
    e("c4", 5, 7, true, "loved", "work", "clean", 93),
    e("c7", 7, 16, false, "fine", "catchup", "indulgent", 86),
    e("c28", 9, 11, true, "loved", "catchup", "cozy", 83),
    e("c4", 11, 7, true, "loved", "work", "refreshing", 92),
    e("c19", 13, 14, false, "fine", "work", "clean", 87),
    e("c4", 15, 9, true, "loved", "work", "clean", 95),
    e("c8", 17, 12, true, "meh", "grab", "refreshing", 74),
    e("c4", 20, 10, false, "loved", "work", "cozy", 91),
  ];
}

/** Seed once per browser so the demo opens with a rich profile. */
export function seedIfNeeded(existing: MatchEntry[]): MatchEntry[] | null {
  if (localStorage.getItem(SEEDED)) return null;
  localStorage.setItem(SEEDED, "1");
  void existing; return demoHistory(); // fresh demo history for the real Boston corpus
}
