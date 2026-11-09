import type { Cafe } from "./types";

export interface Visit { cafeId: string; at: number; drink: string; beans: number; seasonal?: boolean | undefined }
export interface BeanTx { at: number; delta: number; label: string; cafeId?: string | undefined }
export interface Perk { cafeId: string; text: string; expires: number }
export interface Loyalty { visits: Visit[]; beans: BeanTx[]; perks: Perk[]; shareWithFriends: boolean }

export const BEANS_PER_CHECKIN = 20;
export const DOUBLE_BEANS = 40;
export const FIRST_DATE_BONUS = 10;
export const BEANS_PER_FREE_DRINK = 100;
const DAY = 86_400_000;
const WEEK = 7 * DAY;

export function beansFor(offerActive: boolean) { return offerActive ? DOUBLE_BEANS : BEANS_PER_CHECKIN; }
export function balance(l: Loyalty) { return l.beans.reduce((s, t) => s + t.delta, 0); }

export type StageId = "first" | "seeing" | "regular";
export const STAGES: { id: StageId; min: number; name: string; emoji: string; perk: string }[] = [
  { id: "first", min: 1, name: "First Date", emoji: "💫", perk: "+10 bonus Beans" },
  { id: "seeing", min: 3, name: "Seeing Each Other", emoji: "💕", perk: "Free size upgrade" },
  { id: "regular", min: 5, name: "Regulars", emoji: "💍", perk: "Free pastry once a month + Regular badge" },
];
export function stageFor(count: number) {
  let s: (typeof STAGES)[number] | null = null;
  for (const x of STAGES) if (count >= x.min) s = x;
  return s;
}
export function nextStage(count: number) { return STAGES.find((s) => count < s.min) ?? null; }
export function visitCount(l: Loyalty, cafeId: string) { return l.visits.filter((v) => v.cafeId === cafeId).length; }

/** Monday 00:00 local of the week containing t. */
export function weekStart(t: number) {
  const d = new Date(t); d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // Mon = 0
  return d.getTime() - dow * DAY;
}

/** For each week, the café whose First Date (first-ever check-in) happened that week. */
export function firstDatesByWeek(visits: Visit[]) {
  const seen = new Set<string>(); const out = new Map<number, string[]>();
  for (const v of [...visits].sort((a, b) => a.at - b.at)) {
    if (seen.has(v.cafeId)) continue;
    seen.add(v.cafeId);
    const w = weekStart(v.at); out.set(w, [...(out.get(w) ?? []), v.cafeId]);
  }
  return out;
}

/** Consecutive weeks with a First Date. The current week only extends the streak once it's done; until then it doesn't break it. */
export function streak(visits: Visit[], now: number) {
  const fd = firstDatesByWeek(visits);
  const thisWeek = weekStart(now);
  const doneThisWeek = fd.has(thisWeek);
  let n = doneThisWeek ? 1 : 0;
  let w = weekStart(thisWeek - DAY);
  while (fd.has(w)) { n++; w = weekStart(w - DAY); }
  const daysLeft = Math.max(0, Math.ceil((thisWeek + WEEK - now) / DAY));
  return { weeks: n, doneThisWeek, daysLeft };
}

/** The 7 days of the current week with whether the user checked in that day. */
export function weekDays(visits: Visit[], now: number) {
  const start = weekStart(now); const today = new Date(now); today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const t = start + i * DAY; const d = new Date(t);
    return { label: "MTWTFSS"[i]!, date: d.getDate(), today: t === today.getTime(), checkedIn: visits.some((v) => v.at >= t && v.at < t + DAY) };
  });
}

/** Past weeks newest first, with the café(s) that kept each alive. */
export function streakCalendar(visits: Visit[], now: number, weeks = 8) {
  const fd = firstDatesByWeek(visits);
  return Array.from({ length: weeks }, (_, i) => { const w = weekStart(weekStart(now) - i * WEEK + DAY); return { start: w, cafes: fd.get(w) ?? [] }; });
}

export const STREAK_MILESTONES = [4, 8, 12];

export interface Challenge { id: string; title: string; desc: string; goal: number; progress: number; reward: string; beans: number; sponsored?: string; daysLeft: number; done: boolean }

export function challenges(visits: Visit[], cafes: Cafe[], now: number): Challenge[] {
  const d = new Date(now); const mStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
  const month = visits.filter((v) => v.at >= mStart && v.at < mEnd);
  const daysLeft = Math.ceil((mEnd - now) / DAY);
  const hoods = new Set(month.map((v) => cafes.find((c) => c.id === v.cafeId)?.neighborhood).filter(Boolean));
  const maple = month.some((v) => v.cafeId === "c4" && /maple/i.test(v.drink));
  const mk = (c: Omit<Challenge, "daysLeft" | "done">): Challenge => ({ ...c, progress: Math.min(c.progress, c.goal), daysLeft, done: c.progress >= c.goal });
  return [
    mk({ id: "cozy", title: "Cozy Season 🍂", desc: "Try 3 spiced or seasonal drinks", goal: 3, progress: month.filter((v) => v.seasonal).length, reward: "Cozy Connoisseur badge + 30 Beans", beans: 30 }),
    mk({ id: "hopper", title: "Neighborhood Hopper 🗺️", desc: "Check in at cafés in 3 neighborhoods", goal: 3, progress: hoods.size, reward: "Hopper badge + 30 Beans", beans: 30 }),
    mk({ id: "render", title: "Sponsored by Render Coffee ☕", desc: "Try their maple latte this month", goal: 1, progress: maple ? 1 : 0, reward: "Free pastry", beans: 0, sponsored: "Render Coffee" }),
  ];
}

export const SEASONAL = /spice|pumpkin|maple|chai|cinnamon|cider|gingerbread|seasonal/i;

export interface CheckInResult { next: Loyalty; earned: number; messages: string[] }

/** One verified check-in: Beans, stage-ups, streak and challenge progress. */
export function checkIn(l: Loyalty, cafe: Cafe, drink: string, offerActive: boolean, now: number, cafes: Cafe[]): CheckInResult {
  const before = visitCount(l, cafe.id);
  const beforeStreak = streak(l.visits, now);
  const beforeCh = challenges(l.visits, cafes, now);
  const earned = beansFor(offerActive);
  const visit: Visit = { cafeId: cafe.id, at: now, drink, beans: earned, seasonal: SEASONAL.test(drink) };
  const tx: BeanTx[] = [{ at: now, delta: earned, label: offerActive ? `Check-in · Double Beans ⚡` : "Check-in", cafeId: cafe.id }];
  const messages: string[] = [];
  const s0 = stageFor(before), s1 = stageFor(before + 1);
  if (s1 && s1.id !== s0?.id) {
    messages.push(s1.id === "first" ? `First Date with ${cafe.name} 💫 +${FIRST_DATE_BONUS} bonus Beans` : `You and ${cafe.name} are officially ${s1.name} ${s1.emoji} ${s1.perk} unlocked!`);
    if (s1.id === "first") tx.push({ at: now, delta: FIRST_DATE_BONUS, label: "First Date bonus", cafeId: cafe.id });
  }
  const visits = [...l.visits, visit];
  const st = streak(visits, now);
  if (st.doneThisWeek && !beforeStreak.doneThisWeek) messages.push(`🔥 ${st.weeks}-week explore streak!`);
  const after = challenges(visits, cafes, now);
  for (const c of after) if (c.done && !beforeCh.find((b) => b.id === c.id)!.done) {
    messages.push(`🏆 ${c.title} complete! ${c.reward}`);
    if (c.beans) tx.push({ at: now, delta: c.beans, label: `Challenge: ${c.title}` });
  }
  return { next: { ...l, visits, beans: [...l.beans, ...tx] }, earned, messages };
}

export function redeem(l: Loyalty, now: number): { next: Loyalty; code: string } | null {
  if (balance(l) < BEANS_PER_FREE_DRINK) return null;
  const code = `BEANS-${(now % 100000).toString(36).toUpperCase().padStart(4, "0")}`;
  return { next: { ...l, beans: [...l.beans, { at: now, delta: -BEANS_PER_FREE_DRINK, label: `Free drink · ${code}` }] }, code };
}

// ---------- Friends ----------
export interface FriendVisit { friend: string; cafeId: string; stage: StageId; order: string; quote: string; loved: boolean }
export const FRIENDS = [
  { name: "Priya", initial: "P" }, { name: "Marcus", initial: "M" }, { name: "Sofia", initial: "S" },
  { name: "Jae", initial: "J" }, { name: "Nora", initial: "N" }, { name: "Diego", initial: "D" },
];
export const FRIEND_VISITS: FriendVisit[] = [
  { friend: "Priya", cafeId: "c5", stage: "regular", order: "oat cortado", quote: "Best quiet corner in the Leather District", loved: true },
  { friend: "Jae", cafeId: "c5", stage: "first", order: "pour-over", quote: "Serious beans, chill crowd", loved: true },
  { friend: "Nora", cafeId: "c5", stage: "seeing", order: "flat white", quote: "My Sunday reset", loved: true },
  { friend: "Marcus", cafeId: "c11", stage: "seeing", order: "americano", quote: "Studying under those ceilings hits different", loved: true },
  { friend: "Sofia", cafeId: "c9", stage: "regular", order: "sticky bun + latte", quote: "The sticky bun. That's it. That's the review", loved: true },
  { friend: "Diego", cafeId: "c9", stage: "first", order: "iced latte", quote: "Worth the line", loved: true },
  { friend: "Priya", cafeId: "c16", stage: "seeing", order: "cappuccino", quote: "Gorgeous light, great outlets", loved: true },
  { friend: "Jae", cafeId: "c12", stage: "regular", order: "espresso", quote: "Best espresso in Cambridge, fight me", loved: true },
  { friend: "Nora", cafeId: "c26", stage: "first", order: "chai", quote: "Cozy JP energy", loved: true },
  { friend: "Diego", cafeId: "c21", stage: "first", order: "drip", quote: "Fine in a pinch", loved: false },
  { friend: "Marcus", cafeId: "c27", stage: "first", order: "cortado", quote: "Tiny but mighty", loved: true },
];
export function friendsAt(cafeId: string) { return FRIEND_VISITS.filter((f) => f.cafeId === cafeId); }
/** Small boost for cafés friends loved; applied to already-filtered results only. */
export function friendBoost(cafeId: string) { return Math.min(3, friendsAt(cafeId).filter((f) => f.loved).length); }
export function lovedByFriends(l: Loyalty) {
  const visited = new Set(l.visits.map((v) => v.cafeId));
  const ids = [...new Set(FRIEND_VISITS.filter((f) => f.loved).map((f) => f.cafeId))].filter((id) => !visited.has(id));
  return ids.sort((a, b) => friendBoost(b) - friendBoost(a));
}

// ---------- Demo seed ----------
export const LOYALTY_KEY = "cc-loyalty-v1";

/** 260 Beans, 4-week streak (this week not yet done), 2 Regulars, 3 Seeing Each Other, 6 First Dates, 1 Rekindle perk, Cozy Season 2/3. */
export function demoLoyalty(now = Date.now()): Loyalty {
  const wk = weekStart(now);
  const at = (weeksAgo: number, day: number) => wk - weeksAgo * WEEK + day * DAY + 9 * 3600_000;
  const visits: Visit[] = [];
  const add = (cafeId: string, t: number, drink: string, seasonal = false) => visits.push({ cafeId, at: t, drink, beans: BEANS_PER_CHECKIN, seasonal });
  // First dates: one per week for the last 4 weeks (the streak), the rest 6–9 weeks ago (week 5 empty).
  const firsts: [string, number][] = [["c4", 9], ["c1", 9], ["c3", 8], ["c2", 8], ["c7", 7], ["c10", 7], ["c6", 6], ["c4x", 0], ["c19", 4], ["c24", 3], ["c28", 2], ["c13", 1]];
  for (const [id, w] of firsts) if (id !== "c4x") add(id, at(w, 2), "Latte");
  // Regulars: Render (c4) and Tatte (c1) → 5+ visits; Seeing: George Howell, Thinking Cup, Vittoria → 3.
  for (const w of [8, 6, 5, 3]) add("c4", at(w, 4), "Oat cortado");
  for (const w of [7, 5, 2, 4]) add("c1", at(w, 5), "Americano");
  for (const id of ["c3", "c2", "c7"]) { add(id, at(6, 3), "Cappuccino"); add(id, at(4, 1), "Cappuccino"); }
  // This week: repeat visits only (streak not done), two seasonal drinks for Cozy Season.
  if (now - wk > DAY) add("c4", wk + 9 * 3600_000, "Pumpkin spice latte", true);
  add("c1", Math.min(now - 3600_000, wk + DAY + 9 * 3600_000), "Chai latte", true);
  visits.sort((a, b) => a.at - b.at);
  const seen = new Set<string>();
  const beans: BeanTx[] = [];
  for (const v of visits) {
    beans.push({ at: v.at, delta: BEANS_PER_CHECKIN, label: "Check-in", cafeId: v.cafeId });
    if (!seen.has(v.cafeId)) { seen.add(v.cafeId); beans.push({ at: v.at, delta: FIRST_DATE_BONUS, label: "First Date bonus", cafeId: v.cafeId }); }
  }
  const earned = beans.reduce((s, t) => s + t.delta, 0);
  const redemptions = Math.floor((earned - 260) / BEANS_PER_FREE_DRINK);
  [["c4", 7], ["c1", 5], ["c3", 3], ["c4", 1]].slice(0, redemptions).forEach(([id, w]) => beans.push({ at: at(w as number, 6), delta: -BEANS_PER_FREE_DRINK, label: "Free drink", cafeId: id as string }));
  const rest = earned - redemptions * BEANS_PER_FREE_DRINK - 260;
  if (rest) beans.push({ at: at(2, 6), delta: -rest, label: "Free size upgrade", cafeId: "c4" });
  beans.sort((a, b) => a.at - b.at);
  return { visits, beans, perks: [{ cafeId: "c7", text: "Caffè Vittoria misses you. Free cannoli this week 🍰", expires: now + 6 * DAY }], shareWithFriends: true };
}

export function loadLoyalty(): Loyalty {
  try { const s = localStorage.getItem(LOYALTY_KEY); if (s) return JSON.parse(s); } catch { /* reseed */ }
  const l = demoLoyalty(); saveLoyalty(l); return l;
}
export function saveLoyalty(l: Loyalty) { localStorage.setItem(LOYALTY_KEY, JSON.stringify(l)); }
