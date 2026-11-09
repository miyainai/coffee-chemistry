import { useRef, useState } from "react";
import { Coffee, X, ChevronLeft, ChevronRight, Info, MapPin, Star } from "lucide-react";
import type { RecoCard } from "@/lib/reco/types";
import { fmtMin } from "@/lib/reco/engine";
import { FriendsOnCard } from "./Loyalty";
import p1 from "@/assets/cafe-1.jpg";
import p2 from "@/assets/cafe-2.jpg";
import p3 from "@/assets/cafe-3.jpg";
import p4 from "@/assets/cafe-4.jpg";
import p5 from "@/assets/cafe-5.jpg";
import p6 from "@/assets/cafe-6.jpg";

const POOL = [p1, p2, p3, p4, p5, p6];
export function photosFor(id: string) {
  const n = Number(id.replace(/\D/g, "")) || 0;
  return [POOL[n % 6]!, POOL[(n + 1) % 6]!, POOL[(n + 3) % 6]!];
}

export function Deck({ cards, onMatch, onPass }: { cards: RecoCard[]; onMatch: (c: RecoCard) => void; onPass: (c: RecoCard) => void }) {
  const [i, setI] = useState(0);
  const [details, setDetails] = useState(false);
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const idx = Math.min(i, cards.length - 1);
  const card = cards[idx];

  if (!card) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-serif text-3xl">That's everyone for today ☕</p>
      <p className="mt-2 text-muted-foreground">Check in again for a fresh batch.</p>
    </div>
  );

  const pass = () => { setDx(0); onPass(card); };
  const like = () => { setDx(0); onMatch(card); };
  const end = () => { if (dx > 110) like(); else if (dx < -110) pass(); else setDx(0); start.current = null; };

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-sm text-muted-foreground">{idx + 1} of {cards.length}</p>
      <div
        className="w-full touch-pan-y select-none transition-transform duration-200"
        style={{ transform: `translateX(${dx}px) rotate(${dx / 25}deg)`, transitionDuration: start.current === null ? "200ms" : "0ms" }}
        onPointerDown={(e) => { start.current = e.clientX; }}
        onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current); }}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <CafeCard key={card.cafeId} card={card} onLike={like} onOpen={() => Math.abs(dx) < 6 && setDetails(true)} hint={dx} />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <RoundBtn label="Previous" onClick={() => setI(Math.max(0, idx - 1))} disabled={idx === 0} small><ChevronLeft /></RoundBtn>
        <RoundBtn label="Pass" onClick={pass}><X className="h-7 w-7" /></RoundBtn>
        <RoundBtn label="Details" onClick={() => setDetails(true)} small><Info /></RoundBtn>
        <RoundBtn label="Match" onClick={like} primary><Coffee className="h-7 w-7" /></RoundBtn>
        <RoundBtn label="Next" onClick={() => setI(Math.min(cards.length - 1, idx + 1))} disabled={idx === cards.length - 1} small><ChevronRight /></RoundBtn>
      </div>
      {details && <DetailsSheet card={card} onClose={() => setDetails(false)} onLike={() => { setDetails(false); like(); }} />}
    </div>
  );
}

function RoundBtn({ children, onClick, label, primary, small, disabled }: { children: React.ReactNode; onClick: () => void; label: string; primary?: boolean; small?: boolean; disabled?: boolean }) {
  return (
    <button aria-label={label} onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center rounded-full shadow-[var(--shadow-card)] transition active:scale-90 disabled:opacity-30 ${small ? "h-11 w-11 bg-card text-muted-foreground" : "h-16 w-16"} ${primary ? "bg-primary text-primary-foreground" : small ? "" : "bg-card text-foreground"}`}>
      {children}
    </button>
  );
}

function CafeCard({ card, onLike, onOpen, hint }: { card: RecoCard; onLike: () => void; onOpen: () => void; hint: number }) {
  const photos = photosFor(card.cafeId);
  const [p, setP] = useState(0);
  return (
    <article className="overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-card)]">
      <div className="relative aspect-square w-full">
        <img src={photos[p]} alt={`${card.name} photo ${p + 1}`} width={768} height={1024} draggable={false} className="h-full w-full object-cover" />
        <div className="absolute inset-x-3 top-3 flex gap-1">
          {photos.map((_, k) => <span key={k} className={`h-1 flex-1 rounded-full ${k === p ? "bg-card" : "bg-card/40"}`} />)}
        </div>
        <button aria-label="Previous photo" className="absolute inset-y-0 left-0 w-1/3" onClick={(e) => { e.stopPropagation(); setP((p + photos.length - 1) % photos.length); }} />
        <button aria-label="Next photo" className="absolute inset-y-0 right-0 w-1/3" onClick={(e) => { e.stopPropagation(); setP((p + 1) % photos.length); }} />
        <button aria-label="Match with coffee mug" onClick={(e) => { e.stopPropagation(); onLike(); }}
          className="absolute right-4 top-6 flex h-14 w-14 items-center justify-center rounded-full bg-card/90 text-primary shadow-lg backdrop-blur transition active:scale-90">
          <Coffee className="h-7 w-7" />
        </button>
        {card.promoted && <span className="absolute left-4 top-6 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">Promoted</span>}
        {hint > 40 && <span className="absolute left-6 top-24 -rotate-12 rounded-xl border-4 border-accent px-3 py-1 font-serif text-2xl text-accent">MATCH</span>}
        {hint < -40 && <span className="absolute right-6 top-24 rotate-12 rounded-xl border-4 border-destructive px-3 py-1 font-serif text-2xl text-destructive">PASS</span>}
        {card.offer && <OfferRibbon card={card} className="absolute inset-x-0 bottom-0" />}
      </div>
      <button onClick={onOpen} className="block w-full p-5 text-left">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-serif text-3xl">{card.name}</h2>
          <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm font-semibold">{card.match}% match</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{card.neighborhood} · {card.walkMin} min walk · {"$".repeat(card.priceLevel)} · ★ {card.rating}</p>
        <div className="mt-4 rounded-2xl bg-muted p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Order this</p>
          <p className="mt-1 font-serif text-xl">{card.heroLine}</p>
        </div>
        {card.why && <p className="mt-3 text-sm italic text-muted-foreground">“{card.why}”</p>}
        <FriendsOnCard cafeId={card.cafeId} />
      </button>
    </article>
  );
}

export function OfferRibbon({ card, className = "" }: { card: RecoCard; className?: string }) {
  if (!card.offer) return null;
  return (
    <div className={`bg-offer px-4 py-2 text-sm font-medium text-offer-foreground ${className}`}>
      ⚡ {fmtMin(card.offer.startMin)}–{fmtMin(card.offer.endMin)}: {card.offer.text}
    </div>
  );
}

function DetailsSheet({ card, onClose, onLike }: { card: RecoCard; onClose: () => void; onLike: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40" onClick={onClose}>
      <div className="animate-slide-in max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-background p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-3xl">{card.name}</h2>
            <p className="text-sm text-muted-foreground"><MapPin className="mr-1 inline h-3.5 w-3.5" />{card.neighborhood} · {card.walkMin} min · open {card.hours}</p>
          </div>
          <button aria-label="Close" onClick={onClose} className="rounded-full bg-muted p-2"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 flex snap-x gap-2 overflow-x-auto">
          {photosFor(card.cafeId).map((src, k) => <img key={k} src={src} alt="" loading="lazy" width={768} height={1024} className="h-48 w-36 shrink-0 snap-start rounded-2xl object-cover" />)}
        </div>
        <OfferRibbon card={card} className="mt-4 rounded-2xl" />
        <Section title="The vibe">
          <div className="flex flex-wrap gap-2">{card.cafeTags.map((t) => <span key={t} className="rounded-full border px-3 py-1 text-sm">{t}</span>)}</div>
        </Section>
        <Section title="On the menu">
          <ul className="space-y-1">{card.drinks.map((d) => <li key={d} className={d === card.heroDrink ? "font-semibold" : ""}>{d}{d === card.heroDrink && " ← your pick"}</li>)}</ul>
        </Section>
        <Section title="What regulars say">
          {card.reviewSnippets.map((r) => <p key={r} className="mb-2 text-sm"><Star className="mr-1 inline h-3.5 w-3.5 text-accent" />“{r}”</p>)}
        </Section>
        <button onClick={onLike} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-primary-foreground"><Coffee className="h-5 w-5" /> Match with {card.name}</button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-5"><h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{title}</h3>{children}</section>;
}

export function MatchModal({ card, onClose, onChat, onCheckIn, claimed }: { card: RecoCard; onClose: () => void; onChat?: () => void; onCheckIn?: () => void; claimed?: boolean }) {
  const [copied, setCopied] = useState(false);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.name + " " + card.neighborhood + " Boston")}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 p-6">
      <div className="animate-slide-in w-full max-w-sm overflow-hidden rounded-[2rem] bg-background text-center">
        <img src={photosFor(card.cafeId)[0]} alt="" width={768} height={1024} className="h-44 w-full object-cover" />
        <div className="p-6">
          <p className="font-serif text-4xl">It's a match! ☕</p>
          <p className="mt-2 text-muted-foreground">You and {card.name} are brewing something.</p>
          <div className="mt-5 rounded-2xl bg-muted p-4 text-left">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Your order</p>
            <p className="font-serif text-xl">{card.heroDrink}</p>
          </div>
          {card.offer && (
            <div className="mt-3 rounded-2xl bg-offer p-4 text-left text-offer-foreground">
              <p className="text-sm">⚡ {card.offer.text}</p>
              <p className="mt-1 text-xs">Show this code at the counter</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-widest">{card.offer.code}</p>
              <button onClick={() => { navigator.clipboard?.writeText(card.offer!.code); setCopied(true); }} className="mt-2 rounded-full border border-current px-3 py-1 text-xs">{copied ? "Copied ✓" : "Copy code"}</button>
            </div>
          )}
          {onCheckIn && <button onClick={onCheckIn} className="mt-5 block w-full rounded-full bg-offer py-3 font-medium text-offer-foreground">📍 Check in at café · earn Beans</button>}
          {onChat && <button onClick={onChat} className="mt-5 block w-full rounded-full bg-primary py-3 text-primary-foreground">💬 Chat with {card.name}</button>}
          <a href={maps} target="_blank" rel="noreferrer" className={`mt-3 block rounded-full py-3 ${onChat ? "border" : "bg-primary text-primary-foreground"}`}>Get directions · {card.walkMin} min</a>
          <p className="mt-3 text-xs text-muted-foreground">{claimed ? "Deal claimed ✓" : "Saved to your profile ✓"}</p>
          <button onClick={onClose} className="mt-1 w-full py-2 text-muted-foreground">Keep browsing</button>
        </div>
      </div>
    </div>
  );
}
