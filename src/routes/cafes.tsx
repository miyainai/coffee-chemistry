import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CAFES } from "@/lib/reco/cafes";
import { loadHistory, type MatchEntry } from "@/lib/reco/history";
import { STAGES, loadLoyalty, nextStage, stageFor, type Loyalty } from "@/lib/reco/loyalty";
import { BottomTabs, RekindleList } from "@/components/coffee/Loyalty";
import { photosFor } from "@/components/coffee/Deck";
import { CafeProfileSheet } from "@/components/coffee/CafeProfile";

export const Route = createFileRoute("/cafes")({
  head: () => ({
    meta: [
      { title: "Your Cafés — Coffee Chemistry" },
      { name: "description", content: "Every café you've checked in at, from First Dates to Regulars, with your perks and progress." },
      { property: "og:title", content: "Your Cafés — Coffee Chemistry" },
      { property: "og:description", content: "Your café relationships, perks and progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CafesPage,
});

function CafesPage() {
  const [loy, setLoy] = useState<Loyalty | null>(null);
  const [hist, setHist] = useState<MatchEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { setLoy(loadLoyalty()); setHist(loadHistory()); }, []);
  if (!loy) return <main className="min-h-screen" />;

  const ids = [...new Set(loy.visits.map((v) => v.cafeId))];
  const rows = ids.map((id) => {
    const vs = loy.visits.filter((v) => v.cafeId === id);
    const orders: Record<string, number> = {}; vs.forEach((v) => (orders[v.drink] = (orders[v.drink] ?? 0) + 1));
    return { id, count: vs.length, cafe: CAFES.find((c) => c.id === id)!, order: Object.entries(orders).sort((a, b) => b[1] - a[1])[0]![0] };
  });
  const saved = [...new Set(hist.map((e) => e.card.cafeId))].filter((id) => !ids.includes(id));

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-28 pt-5 font-sans">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl">Coffee Chemistry</Link>
      </header>
      <h1 className="font-serif text-4xl">Your Cafés 💛</h1>
      <p className="mt-1 text-sm text-muted-foreground">{ids.length} cafés · check in to move things forward.</p>
      <div className="mt-5"><RekindleList perks={loy.perks.filter((p) => p.expires > Date.now())} /></div>

      {[...STAGES].reverse().map((st) => {
        const list = rows.filter((r) => stageFor(r.count)?.id === st.id).sort((a, b) => b.count - a.count);
        if (!list.length) return null;
        return (
          <section key={st.id} className="mt-7">
            <h2 className="font-serif text-2xl">{st.emoji} {st.name} <span className="text-base text-muted-foreground">({list.length})</span></h2>
            <ul className="mt-3 space-y-3">
              {list.map((r) => {
                const nx = nextStage(r.count);
                const prevMin = st.min;
                return (
                  <li key={r.id}>
                    <button onClick={() => setOpenId(r.id)} className="flex w-full gap-3 rounded-2xl bg-card p-3 text-left shadow-[var(--shadow-card)] transition active:scale-[0.98]">
                    <img src={photosFor(r.id)[0]} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-serif text-lg">{r.cafe.name}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{r.count} check-in{r.count === 1 ? "" : "s"}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">Go-to: {r.order} · {r.cafe.neighborhood}</p>
                      {nx ? (
                        <>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${((r.count - prevMin + 1) / (nx.min - prevMin + 1)) * 100}%` }} /></div>
                          <p className="mt-1 text-xs">{r.count}/{nx.min} to {nx.name}</p>
                        </>
                      ) : <p className="mt-2 text-xs font-medium">💍 Regular badge — show your barista</p>}
                      <p className="mt-1 text-xs text-muted-foreground">🎁 {st.perk}</p>
                    </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {saved.length > 0 && (
        <section className="mt-7">
          <h2 className="font-serif text-2xl">Saved, not yet dated</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {saved.map((id) => { const c = CAFES.find((x) => x.id === id); if (!c) return null; return (
              <button key={id} onClick={() => setOpenId(id)} className="overflow-hidden rounded-2xl bg-card text-left shadow-sm transition active:scale-[0.98]">
                <img src={photosFor(id)[0]} alt="" className="h-20 w-full object-cover" />
                <p className="p-2 text-sm font-medium">{c.name}</p>
              </button>
            ); })}
          </div>
        </section>
      )}
      <BottomTabs active="cafes" />
      {openId && (() => {
        const cafe = CAFES.find((c) => c.id === openId);
        if (!cafe) return null;
        const row = rows.find((r) => r.id === openId);
        const st = row ? stageFor(row.count) : null;
        return (
          <CafeProfileSheet
            cafe={cafe}
            visits={row?.count}
            goTo={row?.order}
            stageLabel={st ? `${st.emoji} ${st.name}` : "💛 Saved"}
            onClose={() => setOpenId(null)}
          />
        );
      })()}
    </main>
  );
}
