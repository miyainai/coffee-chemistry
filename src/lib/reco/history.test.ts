import { describe, it, expect } from "vitest";
import { filterHistory, type MatchEntry } from "./history";
import type { RecoCard } from "./types";

const card = (id: string, o: Partial<RecoCard> = {}) => ({ cafeId: id, name: id, neighborhood: "South End", walkMin: 5, priceLevel: 2, match: 80, offer: null, ...o }) as RecoCard;
const h: MatchEntry[] = [
  { card: card("a"), at: 1, plan: "work" },
  { card: card("b", { match: 95, priceLevel: 3 }), at: 2, plan: "grab" },
  { card: card("a"), at: 3, plan: "work" },
];

describe("history filters", () => {
  it("filters by plan", () => expect(filterHistory(h, { plan: "work" })).toHaveLength(2));
  it("filters by max price", () => expect(filterHistory(h, { maxPrice: 2 }).every((e) => e.card.cafeId === "a")).toBe(true));
  it("sorts recent first", () => expect(filterHistory(h, {})[0]!.at).toBe(3));
  it("sorts by match", () => expect(filterHistory(h, { sort: "match" })[0]!.card.cafeId).toBe("b"));
  it("sorts by visits", () => expect(filterHistory(h, { sort: "visits" })[0]!.card.cafeId).toBe("a"));
});
