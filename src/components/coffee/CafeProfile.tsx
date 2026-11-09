import { useState } from "react";
import { Coffee, MapPin, Star, X } from "lucide-react";
import type { Cafe } from "@/lib/reco/types";
import { fmtMin } from "@/lib/reco/engine";
import { photosFor } from "./Deck";

/**
 * Tappable café profile, opened from Your Cafés (and anywhere else with a Cafe).
 * Rendered as a bottom sheet; inside the demo phone frame it stays within the screen.
 */
export function CafeProfileSheet({
  cafe,
  visits,
  goTo,
  stageLabel,
  onClose,
}: {
  cafe: Cafe;
  visits?: number | undefined;
  goTo?: string | undefined;
  stageLabel?: string | undefined;
  onClose: () => void;
}) {
  const photos = photosFor(cafe.id);
  const [p, setP] = useState(0);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name + " " + cafe.neighborhood + " Boston")}`;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40" onClick={onClose}>
      <div
        className="animate-slide-in max-h-[88%] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-background pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] w-full">
          <img src={photos[p]} alt={`${cafe.name} photo ${p + 1}`} className="h-full w-full object-cover" />
          <div className="absolute inset-x-3 top-3 flex gap-1">
            {photos.map((_, k) => <span key={k} className={`h-1 flex-1 rounded-full ${k === p ? "bg-card" : "bg-card/40"}`} />)}
          </div>
          <button aria-label="Previous photo" className="absolute inset-y-0 left-0 w-1/3" onClick={() => setP((p + photos.length - 1) % photos.length)} />
          <button aria-label="Next photo" className="absolute inset-y-0 right-0 w-1/3" onClick={() => setP((p + 1) % photos.length)} />
          <button aria-label="Close" onClick={onClose} className="absolute right-4 top-4 rounded-full bg-card/90 p-2 backdrop-blur"><X className="h-4 w-4" /></button>
          {cafe.promoted && <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">Promoted</span>}
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-serif text-3xl">{cafe.name}</h2>
            <span className="shrink-0 text-sm font-semibold">★ {cafe.rating} <span className="font-normal text-muted-foreground">({cafe.reviews})</span></span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <MapPin className="mr-1 inline h-3.5 w-3.5" />{cafe.neighborhood} · {"$".repeat(cafe.priceLevel)} · open {fmtMin(cafe.openMin)}–{fmtMin(cafe.closeMin)}
          </p>

          {(visits !== undefined || stageLabel) && (
            <div className="mt-4 rounded-2xl bg-muted p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Your relationship</p>
              <p className="mt-1 font-serif text-xl">{stageLabel} {visits !== undefined && `· ${visits} check-in${visits === 1 ? "" : "s"}`}</p>
              {goTo && <p className="mt-1 text-sm text-muted-foreground">Your go-to: {goTo}</p>}
            </div>
          )}

          {cafe.offers?.map((o) => (
            <div key={o.code} className="mt-3 rounded-2xl bg-offer px-4 py-3 text-sm font-medium text-offer-foreground">
              ⚡ {fmtMin(o.startMin)}–{fmtMin(o.endMin)}: {o.text}
              <span className="ml-2 font-mono text-xs tracking-widest">{o.code}</span>
            </div>
          ))}

          <Section title="The vibe">
            <div className="flex flex-wrap gap-2">{cafe.tags.map((t) => <span key={t} className="rounded-full border px-3 py-1 text-sm">{t}</span>)}</div>
          </Section>

          <Section title="On the menu">
            <ul className="space-y-1">
              {cafe.drinks.map((d) => (
                <li key={d.name} className={d.name === goTo ? "font-semibold" : ""}>
                  {d.name} <span className="text-xs text-muted-foreground">{d.temp === "both" ? "hot or iced" : d.temp}</span>
                  {d.name === goTo && " ← your go-to"}
                </li>
              ))}
            </ul>
          </Section>

          {cafe.reviewSnippets.length > 0 && (
            <Section title="What regulars say">
              {cafe.reviewSnippets.map((r) => <p key={r} className="mb-2 text-sm"><Star className="mr-1 inline h-3.5 w-3.5 text-accent" />“{r}”</p>)}
            </Section>
          )}

          <a href={maps} target="_blank" rel="noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-primary-foreground">
            <Coffee className="h-5 w-5" /> Get directions
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-5"><h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{title}</h3>{children}</section>;
}
