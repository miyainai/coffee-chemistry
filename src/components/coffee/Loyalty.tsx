import { useEffect, useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Share, X } from "lucide-react";
import { CAFES } from "@/lib/reco/cafes";
import {
  BEANS_PER_FREE_DRINK, FRIENDS, STAGES, friendsAt, streak, streakCalendar, weekDays,
  type Challenge, type Perk, type Visit,
} from "@/lib/reco/loyalty";
import { photosFor } from "./Deck";

const cafeName = (id: string) => CAFES.find((c) => c.id === id)?.name ?? "a café";

export function BeansPill({ beans, onClick }: { beans: number; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={`${beans} Beans — redeem`} className="rounded-full bg-offer px-3 py-1 text-sm font-semibold text-offer-foreground shadow-sm">
      ☕ {beans}
    </button>
  );
}

/** Deterministic QR-looking grid — a stand-in for a real code in the demo. */
export function FauxQR({ seed, size = 176 }: { seed: string; size?: number }) {
  const n = 21; let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) { h = (h * 1103515245 + 12345) >>> 0; cells.push(((h >> 16) & 1) === 1); }
  const finder = (x: number, y: number) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx! && x < fx! + 7 && y >= fy! && y < fy! + 7);
  const finderOn = (x: number, y: number) => {
    const [fx, fy] = [[0, 0], [n - 7, 0], [0, n - 7]].find(([a, b]) => x >= a! && x < a! + 7 && y >= b! && y < b! + 7)!;
    const dx = x - fx!, dy = y - fy!; const edge = dx === 0 || dy === 0 || dx === 6 || dy === 6; const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
    return edge || core;
  };
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} className="rounded-xl bg-background text-foreground" shapeRendering="crispEdges">
      {cells.map((on, i) => { const x = i % n, y = Math.floor(i / n); const fill = finder(x, y) ? finderOn(x, y) : on; return fill ? <rect key={i} x={x} y={y} width={1} height={1} fill="currentColor" /> : null; })}
    </svg>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center" onClick={onClose}>
      <div className="animate-slide-in max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-background p-6 sm:rounded-[2rem]" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Close" onClick={onClose} className="float-right rounded-full bg-muted p-2"><X className="h-4 w-4" /></button>
        {children}
      </div>
    </div>
  );
}

export function CheckInQR({ cafeId, doubleBeans, onScan, onClose }: { cafeId: string; doubleBeans: boolean; onScan: () => void; onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <p className="font-serif text-3xl">Check in at {cafeName(cafeId)}</p>
      <p className="mt-1 text-sm text-muted-foreground">Scan at the counter.{doubleBeans && " Double Beans ⚡ right now!"}</p>
      <button onClick={onScan} aria-label="Simulate scan" className="mx-auto mt-6 block rounded-2xl border-4 border-primary p-3 transition active:scale-95">
        <FauxQR seed={cafeId + new Date().toDateString()} size={200} />
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">Demo: tap the code to simulate the barista's scan</p>
    </Sheet>
  );
}

export function RedeemSheet({ beans, code, onRedeem, onClose }: { beans: number; code: string | null; onRedeem: () => void; onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <p className="font-serif text-3xl">☕ {beans} Beans</p>
      <p className="mt-1 text-sm text-muted-foreground">{BEANS_PER_FREE_DRINK} Beans = a free drink at any partner café.</p>
      {code ? (
        <div className="mt-6 text-center">
          <div className="mx-auto inline-block rounded-2xl border-4 border-offer p-3"><FauxQR seed={code} size={180} /></div>
          <p className="mt-3 font-mono text-2xl font-semibold tracking-widest">{code}</p>
          <p className="text-sm text-muted-foreground">Show this at the counter. Enjoy, on us 🎉</p>
        </div>
      ) : (
        <>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-offer" style={{ width: `${Math.min(100, (beans % BEANS_PER_FREE_DRINK) || (beans ? 100 : 0))}%` }} /></div>
          <button disabled={beans < BEANS_PER_FREE_DRINK} onClick={onRedeem} className="mt-5 w-full rounded-full bg-primary py-3 text-primary-foreground disabled:opacity-40">
            {beans >= BEANS_PER_FREE_DRINK ? "Redeem a free drink" : `${BEANS_PER_FREE_DRINK - beans} more Beans to go`}
          </button>
        </>
      )}
    </Sheet>
  );
}

export function BeanRain({ earned, messages, onDone }: { earned: number; messages: string[]; onDone: () => void }) {
  const [n, setN] = useState(0);
  const [step, setStep] = useState(-1);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v >= earned ? v : v + 1)), 600 / earned);
    const steps = messages.map((_, i) => setTimeout(() => setStep(i), 1400 + i * 1500));
    const end = setTimeout(onDone, 1400 + messages.length * 1500 + 1600);
    return () => { clearInterval(id); steps.forEach(clearTimeout); clearTimeout(end); };
  }, [earned, messages, onDone]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80" onClick={onDone}>
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} className="bean-fall absolute top-0 text-2xl" style={{ left: `${(i * 37) % 96}%`, animationDelay: `${(i % 7) * 120}ms` }}>🫘</span>
      ))}
      <div className="stamp-press rounded-3xl bg-background px-8 py-6 text-center shadow-xl">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Checked in ✓</p>
        <p className="font-serif text-5xl text-primary">+{n} Beans ☕</p>
        {step >= 0 && <p key={step} className="animate-slide-in mt-3 max-w-xs font-serif text-xl">{messages[step]}</p>}
      </div>
    </div>
  );
}

/** Streak mark: a coffee mug that fills up as the week goes. */
function Mug({ n, fill }: { n: number; fill: number }) {
  const id = useId();
  const body = "M12 30h32v20c0 9-7 16-16 16s-16-7-16-16z";
  const level = Math.max(0.18, Math.min(1, fill));
  const top = 66 - level * 34;
  return (
    <div className="relative flex h-20 w-16 items-end justify-center">
      <svg viewBox="0 0 64 80" className="absolute inset-0 h-full w-full text-primary" aria-hidden>
        <defs><clipPath id={id}><path d={body} /></clipPath></defs>
        <g className="animate-steam" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M22 24c-4-4 4-7 0-12" />
          <path d="M30 22c-4-4 4-7 0-12" />
          <path d="M38 24c-4-4 4-7 0-12" />
        </g>
        <path d={body} className="fill-card" />
        <rect x="12" y={top} width="32" height={66 - top} className="fill-offer" clipPath={`url(#${id})`} />
        <path d={body} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M44 36c9 0 13 4 13 9s-4 9-13 9" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M8 70h40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="absolute inset-x-0 top-[55%] -translate-y-1/2 text-center font-serif text-2xl font-bold text-primary">{n}</span>
    </div>
  );
}

export function StreakCard({ visits, now }: { visits: Visit[]; now: number }) {
  const [open, setOpen] = useState(false);
  const s = streak(visits, now);
  const days = weekDays(visits, now);
  const share = () => {
    const text = `☕ ${s.weeks}-week café explore streak on Coffee Chemistry`;
    if (navigator.share) navigator.share({ text }).catch(() => {}); else navigator.clipboard?.writeText(text);
  };
  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Your streak</h2>
        <button onClick={share} className="flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5 text-sm font-medium"><Share className="h-4 w-4" /> Share</button>
      </div>
      <button onClick={() => setOpen(true)} className="mt-4 flex w-full items-center gap-3 text-left" aria-label="Open streak calendar">
        <div className="flex shrink-0 flex-col items-center">
          <Mug n={s.weeks} fill={days.filter((d) => d.checkedIn).length / 7} />
          <span className="text-sm font-semibold text-muted-foreground">Weeks</span>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-7 gap-1.5 text-center">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground">{d.label}</span>
              <span className={`flex aspect-square w-full max-w-7 items-center justify-center rounded-full text-xs ${d.checkedIn ? "bg-primary text-primary-foreground" : "bg-muted"} ${d.today ? "ring-2 ring-inset ring-foreground" : ""}`}>{d.date}</span>
            </div>
          ))}
        </div>
      </button>
      <p className="mt-4 text-sm">
        {s.doneThisWeek ? "This week's First Date is done — streak safe ☕" : `${s.daysLeft} day${s.daysLeft === 1 ? "" : "s"} left to find a new First Date ☕`}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">🧊 1 streak freeze left this month · Life happens. Your streak is safe.</p>
      {open && (
        <Sheet onClose={() => setOpen(false)}>
          <p className="font-serif text-3xl">☕ {s.weeks}-week streak</p>
          <p className="text-sm text-muted-foreground">A week counts when you go on a First Date with a new café. Badges at 4, 8 and 12 weeks.</p>
          <ul className="mt-4 space-y-2">
            {streakCalendar(visits, now).map((w) => (
              <li key={w.start} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm">
                <span>{new Date(w.start).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                <span className={w.cafes.length ? "font-medium" : "text-muted-foreground"}>{w.cafes.length ? `☕ ${w.cafes.map(cafeName).join(", ")}` : "—"}</span>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </section>
  );
}

export function ChallengesSection({ list }: { list: Challenge[] }) {
  return (
    <section>
      <h2 className="mb-2 font-serif text-xl">🏆 This month's challenges</h2>
      <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
        {list.map((c) => (
          <article key={c.id} className={`w-64 shrink-0 snap-start rounded-3xl bg-card p-4 shadow-sm ${c.done ? "border-2 border-offer" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-serif text-lg leading-tight">{c.title}</p>
              {c.sponsored && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">Sponsored</span>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(c.progress / c.goal) * 100}%` }} /></div>
            <p className="mt-2 flex justify-between text-xs"><span className="font-medium">{c.done ? "Complete 🎉" : `${c.progress}/${c.goal}`}</span><span className="text-muted-foreground">{c.daysLeft} days left</span></p>
            <p className="mt-1 text-xs text-muted-foreground">🎁 {c.reward}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RekindleList({ perks }: { perks: Perk[] }) {
  if (!perks.length) return null;
  return (
    <section className="rounded-3xl border-2 border-dashed border-primary bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Rekindle 💌</p>
      {perks.map((p, i) => (
        <div key={i} className="mt-2 flex items-center gap-3">
          <img src={photosFor(p.cafeId)[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
          <div><p className="font-serif text-lg leading-tight">{p.text}</p><p className="text-xs text-muted-foreground">Expires {new Date(p.expires).toLocaleDateString(undefined, { weekday: "long" })}</p></div>
        </div>
      ))}
    </section>
  );
}

export function AvatarStack({ names }: { names: string[] }) {
  return (
    <div className="flex -space-x-2">
      {names.slice(0, 3).map((n) => (
        <span key={n} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-semibold">{FRIENDS.find((f) => f.name === n)?.initial ?? n[0]}</span>
      ))}
    </div>
  );
}

const stageLabel = (id: string) => { const s = STAGES.find((x) => x.id === id)!; return `${s.emoji} ${s.id === "regular" ? "Regular" : s.name}`; };

export function FriendsOnCard({ cafeId }: { cafeId: string }) {
  const fs = friendsAt(cafeId).filter((f) => f.loved);
  if (!fs.length) return null;
  const top = fs[0]!;
  return (
    <div className="mt-3 rounded-2xl border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Friends who've been 👯</p>
      <div className="mt-2 flex items-center gap-2">
        <AvatarStack names={fs.map((f) => f.friend)} />
        <p className="text-sm">{top.friend}{fs.length > 1 ? ` and ${fs.length - 1} friend${fs.length > 2 ? "s" : ""}` : ""} loved this</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{top.friend} · {stageLabel(top.stage)} · “{top.quote}” · {top.order}</p>
    </div>
  );
}

export function LovedByFriends({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <section>
      <h2 className="mb-2 font-serif text-xl">👯 Loved by your friends</h2>
      <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
        {ids.map((id) => {
          const fs = friendsAt(id).filter((f) => f.loved); const c = CAFES.find((x) => x.id === id)!;
          return (
            <article key={id} className="w-52 shrink-0 snap-start overflow-hidden rounded-3xl bg-card shadow-sm">
              <img src={photosFor(id)[0]} alt="" className="h-24 w-full object-cover" />
              <div className="p-3">
                <p className="font-serif text-lg leading-tight">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.neighborhood}</p>
                <div className="mt-2 flex items-center gap-2"><AvatarStack names={fs.map((f) => f.friend)} /><span className="text-xs">“{fs[0]!.quote}”</span></div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export const GO_MATCH = "cc-go-match";

export function BottomTabs({ active, onMatch }: { active: "home" | "match" | "cafes" | "me"; onMatch?: () => void }) {
  const cls = (on: boolean) => `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${on ? "font-semibold text-primary" : "text-muted-foreground"}`;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-md pb-4">
        <Link to="/" className={cls(active === "home")}><span className="text-lg">🏠</span>Home</Link>
        {onMatch
          ? <button onClick={onMatch} className={cls(active === "match")}><span className="text-lg">☕</span>Match</button>
          : <Link to="/" onClick={() => sessionStorage.setItem(GO_MATCH, "1")} className={cls(active === "match")}><span className="text-lg">☕</span>Match</Link>}
        <Link to="/cafes" className={cls(active === "cafes")}><span className="text-lg">💛</span>Your Cafés</Link>
        <Link to="/profile" className={cls(active === "me")}><span className="text-lg">👤</span>Me</Link>
      </div>
    </nav>
  );
}
