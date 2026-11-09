import { describe, expect, it } from "vitest";
import { CAFES } from "./cafes";
import { balance, beansFor, challenges, checkIn, demoLoyalty, redeem, stageFor, streak, visitCount } from "./loyalty";

const NOW = new Date(2026, 10, 5, 14, 0).getTime(); // Thu Nov 5 2026
const cafe = (id: string) => CAFES.find((c) => c.id === id)!;

describe("loyalty", () => {
  it("20 Beans per check-in, 40 during an active offer", () => {
    expect(beansFor(false)).toBe(20);
    expect(beansFor(true)).toBe(40);
  });
  it("stages at 1, 3 and 5 check-ins", () => {
    expect(stageFor(0)).toBeNull();
    expect(stageFor(2)?.id).toBe("first");
    expect(stageFor(3)?.id).toBe("seeing");
    expect(stageFor(5)?.id).toBe("regular");
  });
  it("demo user: 260 Beans, 4-week streak not done this week, 2 regulars / 3 seeing / 6 first dates", () => {
    const l = demoLoyalty(NOW);
    expect(balance(l)).toBe(260);
    expect(streak(l.visits, NOW)).toMatchObject({ weeks: 4, doneThisWeek: false });
    const ids = [...new Set(l.visits.map((v) => v.cafeId))];
    const by = (s: string) => ids.filter((id) => stageFor(visitCount(l, id))?.id === s).length;
    expect([by("regular"), by("seeing"), by("first")]).toEqual([2, 3, 6]);
    expect(challenges(l.visits, CAFES, NOW).find((c) => c.id === "cozy")?.progress).toBe(2);
  });
  it("a First Date at a new café extends the streak and pays the bonus (+ 3rd neighborhood finishes Hopper)", () => {
    const l = demoLoyalty(NOW);
    const r = checkIn(l, cafe("c5"), "Pour-over", false, NOW, CAFES);
    expect(balance(r.next) - balance(l)).toBe(20 + 10 + 30);
    expect(streak(r.next.visits, NOW)).toMatchObject({ weeks: 5, doneThisWeek: true });
  });
  it("a repeat visit doesn't extend the streak", () => {
    const l = demoLoyalty(NOW);
    const r = checkIn(l, cafe("c4"), "Latte", false, NOW, CAFES);
    expect(streak(r.next.visits, NOW).doneThisWeek).toBe(false);
  });
  it("third seasonal drink completes Cozy Season and adds 30 Beans", () => {
    const l = demoLoyalty(NOW);
    const r = checkIn(l, cafe("c4"), "Maple latte", false, NOW, CAFES);
    expect(balance(r.next) - balance(l)).toBe(20 + 30);
  });
  it("100 Beans redeem a free drink; not enough Beans → null", () => {
    const l = demoLoyalty(NOW);
    expect(balance(redeem(l, NOW)!.next)).toBe(160);
    expect(redeem({ ...l, beans: [] }, NOW)).toBeNull();
  });
});
