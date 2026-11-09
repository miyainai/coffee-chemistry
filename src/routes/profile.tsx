import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { seedIfNeeded } from "@/lib/reco/seed";
import { saveHistory, filterHistory, loadHistory, visitCounts, type HistoryFilter, type MatchEntry } from "@/lib/reco/history";
import type { Profile } from "@/lib/reco/types";
import { photosFor } from "@/components/coffee/Deck";
import { CAFES } from "@/lib/reco/cafes";
import { FRIENDS, FRIEND_VISITS, balance, loadLoyalty, redeem, saveLoyalty, type Loyalty } from "@/lib/reco/loyalty";
import { AvatarStack, BottomTabs, RedeemSheet } from "@/components/coffee/Loyalty";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Cup — Coffee Chemistry" },
      { name: "description", content: "Your coffee profile and every café you've matched with, filterable by plan, mood, price and distance." },
      { property: "og:title", content: "My Cup — Coffee Chemistry" },
      { property: "og:description", content: "Your coffee profile and match history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const PLANS = [["all", "All"], ["grab", "🏃 Grab & go"], ["work", "💻 Work"], ["catchup", "👯 Catch up"], ["treat", "🎀 Treat"]] as const;
const MOODS = [["all", "Any mood"], ["cozy", "☁️ Cozy"], ["refreshing", "🧊 Refreshing"], ["indulgent", "🍫 Indulgent"], ["clean", "✨ Clean"]] as const;

function status(n: number) { return n >= 5 ? "💖 Super Love" : n >= 3 ? "Going steady" : n >= 2 ? "Second date" : "First match"; }

function ProfilePage() {
  const [hist, setHist] = useState<MatchEntry[]>([]);
  const [prof, setProf] = useState<Profile | null>(null);
  const [loy, setLoy] = useState<Loyalty | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [f, setF] = useState<HistoryFilter>({ plan: "all", mood: "all", neighborhood: "all", sort: "recent" });
  useEffect(() => {
    { const l = loadHistory(); const sd = seedIfNeeded(l); if (sd) saveHistory(sd); setHist(sd ?? l); }
    setLoy(loadLoyalty());
    const s = localStorage.getItem("cc-profile"); if (s) setProf(JSON.parse(s));
  }, []);
  const counts = useMemo(() => visitCounts(hist), [hist]);
  const hoods = useMemo(() => [...new Set(hist.map((e) => e.card.neighborhood))], [hist]);
  const shown = filterHistory(hist, f);
  const chip = (on: boolean) => `shrink-0 rounded-full border px-3 py-1 text-sm ${on ? "bg-primary text-primary-foreground" : "bg-card"}`;
  const fav = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  const beans = loy ? balance(loy) : 0;
  const updLoy = (l: Loyalty) => { setLoy(l); saveLoyalty(l); };
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-28 pt-5 font-sans">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl">Coffee Chemistry</Link>
        <button onClick={() => { setCode(null); setRedeemOpen(true); }} className="rounded-full bg-offer px-3 py-1 text-sm font-semibold text-offer-foreground">☕ {beans}</button>
      </header>

      <section className="rounded-[2rem] bg-card p-5 shadow-[var(--shadow-card)]">
        <h1 className="font-serif text-4xl">My cup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {prof?.usualOrder ?? "No usual yet"} · {prof?.milk ?? "any milk"} · {"$".repeat(prof?.budget ?? 2)} · {prof?.caffeineTolerance ?? "normal"} caffeine
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat n={hist.length} l="Matches" />
          <Stat n={Object.keys(counts).length} l="Cafés" />
          <Stat n={fav ? fav[1] : 0} l="Top streak" />
        </div>
        {fav && <p className="mt-3 text-sm">Most matched: <span className="font-semibold">{hist.find((e) => e.card.cafeId === fav[0])!.card.name}</span> — {status(fav[1])}</p>}
      </section>

      {loy && (
        <section className="mt-6 rounded-[2rem] bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Beans</p><p className="font-serif text-3xl">☕ {beans}</p></div>
            <button onClick={() => { setCode(null); setRedeemOpen(true); }} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Redeem</button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">100 Beans = free drink at any partner café</p>
          <ul className="mt-3 max-h-56 divide-y overflow-y-auto text-sm">
            {[...loy.beans].reverse().map((t, i) => (
              <li key={i} className="flex justify-between py-2">
                <span>{t.label}{t.cafeId && <span className="text-muted-foreground"> · {CAFES.find((c) => c.id === t.cafeId)?.name}</span>}<span className="block text-xs text-muted-foreground">{new Date(t.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></span>
                <span className={`font-semibold ${t.delta < 0 ? "text-destructive" : ""}`}>{t.delta > 0 ? "+" : ""}{t.delta}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {loy && (
        <section className="mt-6 rounded-[2rem] bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Friends 👯</h2><AvatarStack names={FRIENDS.map((x) => x.name)} /></div>
          <ul className="mt-3 space-y-1 text-sm">
            {FRIENDS.map((fr) => { const n = FRIEND_VISITS.filter((v) => v.friend === fr.name).length; return <li key={fr.name} className="flex justify-between"><span>{fr.name}</span><span className="text-muted-foreground">{n} café{n === 1 ? "" : "s"}</span></li>; })}
          </ul>
          <label className="mt-4 flex items-center justify-between gap-3 text-sm">
            Share my check-ins and ratings with friends
            <input type="checkbox" checked={loy.shareWithFriends} onChange={(e) => updLoy({ ...loy, shareWithFriends: e.target.checked })} className="h-5 w-5 accent-[var(--color-primary)]" />
          </label>
          <button onClick={() => { const url = `${location.origin}/?invite=me`; navigator.clipboard?.writeText(url); setCopied(true); }} className="mt-4 w-full rounded-full border py-2.5 text-sm">{copied ? "Invite link copied ✓" : "Invite friends"}</button>
        </section>
      )}
      {redeemOpen && <RedeemSheet beans={beans} code={code} onRedeem={() => { const r = loy && redeem(loy, Date.now()); if (r) { updLoy(r.next); setCode(r.code); } }} onClose={() => setRedeemOpen(false)} />}

      <h2 className="mt-8 font-serif text-2xl">Match history</h2>
      <div className="mt-3 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">{PLANS.map(([v, l]) => <button key={v} className={chip(f.plan === v)} onClick={() => setF({ ...f, plan: v })}>{l}</button>)}</div>
        <div className="flex gap-2 overflow-x-auto pb-1">{MOODS.map(([v, l]) => <button key={v} className={chip(f.mood === v)} onClick={() => setF({ ...f, mood: v })}>{l}</button>)}</div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Neighborhood" value={f.neighborhood} onChange={(e) => setF({ ...f, neighborhood: e.target.value })} className="rounded-full border bg-card px-3 py-1 text-sm">
            <option value="all">All areas</option>{hoods.map((h) => <option key={h}>{h}</option>)}
          </select>
          <select aria-label="Price" value={f.maxPrice ?? ""} onChange={(e) => setF({ ...f, maxPrice: e.target.value ? Number(e.target.value) : undefined })} className="rounded-full border bg-card px-3 py-1 text-sm">
            <option value="">Any price</option><option value="1">$</option><option value="2">≤ $$</option><option value="3">≤ $$$</option>
          </select>
          <select aria-label="Walk" value={f.maxWalk ?? ""} onChange={(e) => setF({ ...f, maxWalk: e.target.value ? Number(e.target.value) : undefined })} className="rounded-full border bg-card px-3 py-1 text-sm">
            <option value="">Any distance</option><option value="5">≤ 5 min</option><option value="15">≤ 15 min</option>
          </select>
          <select aria-label="Sort" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value as "recent" })} className="rounded-full border bg-card px-3 py-1 text-sm">
            <option value="recent">Most recent</option><option value="match">Best match</option><option value="visits">Most visited</option>
          </select>
          <button className={chip(!!f.offersOnly)} onClick={() => setF({ ...f, offersOnly: !f.offersOnly })}>⚡ Had offer</button>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {shown.length === 0 && <li className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">{hist.length ? "No matches fit these filters." : "No matches yet — go find your first café ☕"}</li>}
        {shown.map((e) => {
          const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.card.name + " " + e.card.neighborhood + " Boston")}`;
          return (
            <li key={e.at + e.card.cafeId} className="flex gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]">
              <img src={photosFor(e.card.cafeId)[0]} alt="" width={80} height={80} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-serif text-lg">{e.card.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(e.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </div>
                <p className="text-xs text-muted-foreground">{e.card.neighborhood} · {e.card.walkMin} min · {"$".repeat(e.card.priceLevel)} · {e.card.match}% · {status(counts[e.card.cafeId]!)}</p>
                <p className="mt-1 truncate text-sm">☕ {e.card.heroDrink}</p>
                <a href={maps} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-primary"><MapPin className="h-3.5 w-3.5" />Directions</a>
              </div>
            </li>
          );
        })}
      </ul>
      <BottomTabs active="me" />
    </main>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return <div className="rounded-2xl bg-muted p-3"><p className="font-serif text-2xl">{n}</p><p className="text-xs text-muted-foreground">{l}</p></div>;
}
