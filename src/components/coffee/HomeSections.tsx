import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MatchEntry } from "@/lib/reco/history";
import type { RecoCard } from "@/lib/reco/types";
import { HIT_CHIPS, MISS_CHIPS, fmtCountdown, type Badge, type Deal, type Rating, type Stamp } from "@/lib/reco/passport";
import { photosFor } from "./Deck";

export function YesterdayCard({ entry, onRate }: { entry: MatchEntry; onRate: (r: Rating, chips: string[]) => void }) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  if (done) return <section className="rounded-3xl bg-card p-5 text-center shadow-sm animate-slide-in"><p className="font-serif text-xl">Noted! Your matches just got smarter 🧠</p></section>;
  const opts = rating === "loved" ? HIT_CHIPS : rating === "meh" ? MISS_CHIPS : null;
  const finish = (r: Rating, c: string[]) => { setDone(true); onRate(r, c); };
  const pick = (r: Rating) => { if (r === "fine" || r === "skipped") finish(r, []); else setRating(r); };
  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">⭐ How was yesterday?</p>
      <div className="mt-3 flex items-center gap-3">
        <img src={photosFor(entry.card.cafeId)[0]} alt="" className="h-16 w-16 rounded-2xl object-cover" />
        <div>
          <p className="font-serif text-lg leading-tight">How was {entry.card.name}?</p>
          <p className="text-sm text-muted-foreground">{entry.card.heroDrink} · Spill the tea… or the coffee ☕</p>
        </div>
      </div>
      {!opts ? (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {([["loved", "😍", "Loved it"], ["fine", "🙂", "It was fine"], ["meh", "😕", "Not for me"]] as const).map(([r, e, l]) => (
              <button key={r} onClick={() => pick(r)} className="rounded-2xl border bg-background py-3 text-sm transition hover:border-primary">
                <span className="block text-2xl">{e}</span>{l}
              </button>
            ))}
          </div>
          <button onClick={() => pick("skipped")} className="mt-3 w-full text-xs text-muted-foreground underline">I didn't make it</button>
        </>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-medium">{rating === "loved" ? "What hit?" : "What missed?"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {opts.map((c) => (
              <button key={c} onClick={() => setChips((s) => s.includes(c) ? s.filter((x) => x !== c) : [...s, c])}
                className={`rounded-full border px-3 py-1 text-sm ${chips.includes(c) ? "bg-primary text-primary-foreground" : "bg-background"}`}>{c}</button>
            ))}
          </div>
          <button onClick={() => finish(rating!, chips)} className="mt-4 w-full rounded-full bg-primary py-2.5 text-primary-foreground">Save</button>
        </div>
      )}
    </section>
  );
}

export function DealsCarousel({ deals, minutesNow, onClaim }: { deals: Deal[]; minutesNow: number; onClaim: (c: RecoCard) => void }) {
  return (
    <section>
      <h2 className="mb-2 font-serif text-xl">⚡ Deals near you</h2>
      {deals.length === 0 ? (
        <p className="rounded-3xl bg-card p-5 text-sm text-muted-foreground">No deals brewing right now. Check back around 2 PM ⚡</p>
      ) : (
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
          {deals.map(({ card, endsAt }) => (
            <article key={card.cafeId} className="w-60 shrink-0 snap-start overflow-hidden rounded-3xl border-2 border-offer bg-card">
              <img src={photosFor(card.cafeId)[0]} alt="" className="h-28 w-full object-cover" />
              <div className="p-4">
                <p className="font-serif text-lg leading-tight">{card.name}</p>
                <p className="mt-1 rounded-lg bg-offer px-2 py-1 text-sm text-offer-foreground">{card.offer!.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{card.walkMin} min walk · {card.match}% match</p>
                <p className="text-xs font-medium">{fmtCountdown(endsAt - minutesNow)}</p>
                <button onClick={() => onClaim(card)} className="mt-3 w-full rounded-full bg-primary py-2 text-sm text-primary-foreground">Claim</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function StampBadge({ s, size = 88 }: { s: Stamp; size?: number }) {
  const pct = s.total ? s.explored / s.total : 0;
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center rounded-full border-4 border-dashed border-primary"
        style={{ width: size, height: size, background: `conic-gradient(var(--color-offer) ${pct * 360}deg, transparent 0)` }}>
        <div className="flex h-[78%] w-[78%] -rotate-6 items-center justify-center rounded-full border-2 border-primary bg-background p-1">
          <span className={`font-serif ${s.neighborhood.length > 9 ? "text-[7px] tracking-tight" : "text-[11px]"} break-words text-center font-semibold uppercase leading-tight text-primary`}>{s.neighborhood}</span>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{s.explored}/{s.total} cafés explored</p>
    </div>
  );
}

export function BadgeTile({ b }: { b: Badge }) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${b.unlocked ? "bg-card" : "bg-muted opacity-60 grayscale"}`}>
      <p className="text-3xl">{b.emoji}</p>
      <p className="mt-1 text-sm font-medium">{b.name}</p>
      <p className="text-xs text-muted-foreground">{b.unlocked ? "Unlocked" : `${b.hint} · ${b.progress}/${b.goal}`}</p>
    </div>
  );
}

export function PassportPreview({ stamps, badges }: { stamps: Stamp[]; badges: Badge[] }) {
  const unlocked = badges.filter((b) => b.unlocked).length;
  const latest = stamps[stamps.length - 1];
  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">🛂 Café Passport</p>
      <p className="mt-1 font-serif text-xl">{stamps.length} stamps, {unlocked} badges</p>
      <div className="mt-3 flex items-center justify-between">
        {latest ? <StampBadge s={latest} size={72} /> : <p className="text-sm text-muted-foreground">Rate a visit to earn your first stamp.</p>}
        <Link to="/passport" className="text-sm font-medium">See full passport →</Link>
      </div>
    </section>
  );
}

export function Celebration({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  const bits = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {bits.map((i) => (
        <span key={i} className="confetti absolute top-1/3 h-2 w-2 rounded-sm"
          style={{ left: `${10 + ((i * 37) % 80)}%`, background: i % 3 ? "var(--color-offer)" : "var(--color-primary)", animationDelay: `${(i % 6) * 60}ms` }} />
      ))}
      <div className="stamp-press rounded-3xl border-4 border-primary bg-background px-6 py-4 text-center shadow-xl">
        <p className="font-serif text-2xl text-primary">{text}</p>
      </div>
    </div>
  );
}
