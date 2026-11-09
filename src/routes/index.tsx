import { createFileRoute } from "@tanstack/react-router";
import { addToHistory, loadHistory, saveHistory, type MatchEntry } from "@/lib/reco/history";
import { CAFES } from "@/lib/reco/cafes";
import { activeDeals, applyRating, badges as getBadges, pendingYesterday, stamps as getStamps, type Rating } from "@/lib/reco/passport";
import { seedIfNeeded } from "@/lib/reco/seed";
import { YesterdayCard, DealsCarousel, PassportPreview, Celebration } from "@/components/coffee/HomeSections";
import { CafeChat } from "@/components/coffee/CafeChat";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { getRecommendations } from "@/lib/reco/reco.functions";
import { applySwipe, fmtMin, paidMatchFee } from "@/lib/reco/engine";
import { DEFAULT_LOCATION } from "@/lib/reco/cafes";
import type { CheckIn, Profile, RecoCard } from "@/lib/reco/types";
import { Onboarding } from "@/components/coffee/Onboarding";
import { CheckInFlow } from "@/components/coffee/CheckInFlow";
import { Brewing } from "@/components/coffee/Brewing";
import { Deck, MatchModal } from "@/components/coffee/Deck";
import { balance, challenges as getChallenges, checkIn as doCheckIn, friendBoost, loadLoyalty, lovedByFriends, redeem, saveLoyalty, type Loyalty } from "@/lib/reco/loyalty";
import { BeanRain, BeansPill, BottomTabs, ChallengesSection, CheckInQR, GO_MATCH, LovedByFriends, RedeemSheet, RekindleList, StreakCard } from "@/components/coffee/Loyalty";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coffee Chemistry — Your daily café match" },
      { name: "description", content: "Tell us your mood and plans, then swipe through cafés picked for today — with the perfect drink to order." },
      { property: "og:title", content: "Coffee Chemistry — Your daily café match" },
      { property: "og:description", content: "Tell us your mood and plans, then swipe through cafés picked for today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const DEFAULT_PROFILE: Profile = { budget: 2, caffeineSensitive: false, needsNonDairy: false, radiusScale: 1, tagWeights: {}, passes: [], seenCafeIds: [] };
const REDEEM = "cc-redemptions", KEY = "cc-profile", ONBOARD = "cc-onboarded", DEMO = "cc-demo-time", LEDGER = "cc-paid-matches";
type Stage = "loading" | "home" | "onboarding" | "checkin" | "brewing" | "deck";
type PaidMatch = { cafeId: string; name: string; usd: number; at: number };

function Index() {
  const recommend = useServerFn(getRecommendations);
  const [stage, setStage] = useState<Stage>("loading");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [cards, setCards] = useState<RecoCard[]>([]);
  const [match, setMatch] = useState<RecoCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoMin, setDemoMin] = useState<number | null>(null);
  const [ledger, setLedger] = useState<PaidMatch[]>([]);
  const [panel, setPanel] = useState(false);
  const taps = useRef<number[]>([]);
  const [history, setHistory] = useState<MatchEntry[]>([]);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [chatCard, setChatCard] = useState<RecoCard | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [redemptions, setRedemptions] = useState<{ cafeId: string; code: string; at: number }[]>([]);
  const [clock, setClock] = useState(Date.now());
  const lastCheckin = useRef<CheckIn | null>(null);
  const [loyalty, setLoyalty] = useState<Loyalty>({ visits: [], beans: [], perks: [], shareWithFriends: true });
  const [qrFor, setQrFor] = useState<RecoCard | null>(null);
  const [rain, setRain] = useState<{ earned: number; messages: string[] } | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(s) });
    const d = localStorage.getItem(DEMO); if (d) setDemoMin(Number(d));
    const l = localStorage.getItem(LEDGER); if (l) setLedger(JSON.parse(l));
    const r = localStorage.getItem(REDEEM); if (r) setRedemptions(JSON.parse(r));
    const h = loadHistory(); const seeded = seedIfNeeded(h);
    if (seeded) saveHistory(seeded);
    setHistory(seeded ?? h);
    setLoyalty(loadLoyalty());
    const goMatch = sessionStorage.getItem(GO_MATCH); sessionStorage.removeItem(GO_MATCH);
    setStage(localStorage.getItem(ONBOARD) ? (goMatch ? "checkin" : "home") : "onboarding");
    const t = setInterval(() => setClock(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const d0 = new Date(clock);
  const nowMin = demoMin ?? d0.getHours() * 60 + d0.getMinutes();
  const deals = activeDeals(CAFES, profile, { now: clock, localMinutes: nowMin, tempF: 60, ...DEFAULT_LOCATION });
  const pending = pendingYesterday(history, clock);
  const stampList = getStamps(history, CAFES);
  const badgeList = getBadges(history);

  const beans = balance(loyalty);
  function scan(card: RecoCard) {
    const cafe = CAFES.find((c) => c.id === card.cafeId)!;
    const r = doCheckIn(loyalty, cafe, card.heroDrink, !!card.offer, Date.now(), CAFES);
    setLoyalty(r.next); saveLoyalty(r.next); setQrFor(null); setMatch(null);
    setRain({ earned: r.earned, messages: r.messages });
  }
  function doRedeem() {
    const r = redeem(loyalty, Date.now()); if (!r) return;
    setLoyalty(r.next); saveLoyalty(r.next); setRedeemCode(r.code);
  }

  function rate(entry: MatchEntry, r: Rating, chips: string[]) {
    const beforeS = new Set(stampList.map((s) => s.neighborhood));
    const beforeB = new Set(badgeList.filter((b) => b.unlocked).map((b) => b.id));
    const next = history.map((e) => e === entry ? { ...e, rating: r, chips } : e);
    setHistory(next); saveHistory(next);
    save(applyRating(profile, entry.card, r, chips));
    const newStamp = getStamps(next, CAFES).find((s) => !beforeS.has(s.neighborhood));
    const newBadge = getBadges(next).find((b) => b.unlocked && !beforeB.has(b.id));
    if (newStamp || newBadge) setTimeout(() => setCelebrate(newStamp ? `New stamp! ${newStamp.neighborhood} explorer 🎉` : `Badge unlocked! ${newBadge!.emoji} ${newBadge!.name}`), 900);
  }
  function claim(card: RecoCard) {
    const next = [...redemptions, { cafeId: card.cafeId, code: card.offer!.code, at: Date.now() }];
    setRedemptions(next); localStorage.setItem(REDEEM, JSON.stringify(next));
    setClaimed(true); setMatch(card);
  }
  const save = (p: Profile) => { setProfile(p); localStorage.setItem(KEY, JSON.stringify(p)); };
  const setDemo = (m: number | null) => { setDemoMin(m); if (m === null) localStorage.removeItem(DEMO); else localStorage.setItem(DEMO, String(m)); };

  function tapLogo() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 1500), now];
    if (taps.current.length >= 3) { taps.current = []; setPanel((v) => !v); }
  }

  async function run(c: CheckIn) {
    setStage("brewing"); setError(null); lastCheckin.current = c;
    const d = new Date();
    const localMinutes = demoMin ?? Math.min(d.getHours() * 60 + d.getMinutes(), 1439);
    try {
      const [r] = await Promise.all([
        recommend({ data: { profile, checkin: c, ctx: { now: d.getTime(), localMinutes, tempF: 60, ...DEFAULT_LOCATION } } }),
        new Promise((res) => setTimeout(res, 1800)),
      ]);
      setCards([...r.cards].sort((a, b) => (b.match + friendBoost(b.cafeId)) - (a.match + friendBoost(a.cafeId)))); setStage("deck");
    } catch {
      setError("We couldn't brew your matches. Try again in a moment."); setStage("checkin");
    }
  }

  function onMatch(card: RecoCard) {
    save(applySwipe(profile, card, "heart"));
    const usd = paidMatchFee(card);
    if (usd) { const next = [...ledger, { cafeId: card.cafeId, name: card.name, usd, at: Date.now() }]; setLedger(next); localStorage.setItem(LEDGER, JSON.stringify(next)); }
    const iced = CAFES.find((c) => c.id === card.cafeId)?.drinks.find((x) => x.name === card.heroDrink)?.temp === "iced";
    setHistory(addToHistory({ card, at: Date.now(), plan: lastCheckin.current?.plan, mood: lastCheckin.current?.mood, iced }));
    setClaimed(false); setMatch(card);
    setCards((cs) => cs.filter((x) => x.cafeId !== card.cafeId));
  }
  function onPass(card: RecoCard) {
    save(applySwipe(profile, card, "passVibe"));
    setCards((cs) => cs.filter((x) => x.cafeId !== card.cafeId));
  }

  const revenue = ledger.reduce((s, m) => s + m.usd, 0);

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-28 pt-5 font-sans">
      <header className="mb-4 flex items-center justify-between">
        <button onClick={tapLogo} className="font-serif text-2xl" aria-label="Coffee Chemistry">Coffee Chemistry</button>
        {(stage === "deck" || stage === "checkin" || stage === "home") && (
          <div className="flex gap-3 text-sm text-muted-foreground">
            {stage !== "home" && <button onClick={() => setStage("home")}>Home</button>}
            {stage === "deck" && <button onClick={() => setStage("checkin")}>New check-in</button>}
            {stage !== "home" && <button onClick={() => setStage("onboarding")}>Edit cup</button>}
            {stage === "home" && <BeansPill beans={beans} onClick={() => { setRedeemCode(null); setRedeemOpen(true); }} />}
          </div>
        )}
      </header>

      {panel && (
        <div className="mb-4 rounded-2xl border bg-card p-4 text-sm">
          <p className="font-medium">Demo settings</p>
          <p className="mt-1 text-muted-foreground">Time: {demoMin === null ? "real clock" : fmtMin(demoMin)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([[null, "Real time"], [14 * 60 + 30, "2:30pm"], [9 * 60 + 30, "9:30am"], [16 * 60, "4pm"], [8 * 60, "8am"]] as [number | null, string][]).map(([m, l]) => (
              <button key={l} onClick={() => setDemo(m)} className={`rounded-full border px-3 py-1 ${demoMin === m ? "bg-primary text-primary-foreground" : ""}`}>{l}</button>
            ))}
          </div>
          <p className="mt-3 text-muted-foreground">Paid matches: {ledger.length} · ${revenue.toFixed(2)} earned</p>
          <p className="text-muted-foreground">Deal redemptions: {redemptions.length}</p>
          {ledger.length > 0 && <button onClick={() => { setLedger([]); localStorage.removeItem(LEDGER); }} className="mt-1 text-xs underline">Reset ledger</button>}
        </div>
      )}

      {stage === "onboarding" && <Onboarding profile={profile} onDone={(p) => { save(p); localStorage.setItem(ONBOARD, "1"); setStage("home"); }} />}
      {stage === "checkin" && (
        <>
          {error && <p className="mb-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <CheckInFlow onSubmit={run} />
        </>
      )}
      {stage === "home" && (
        <div className="space-y-5">
          <StreakCard visits={loyalty.visits} now={clock} />
          <section className="rounded-3xl bg-primary p-6 text-primary-foreground">
            <p className="text-xs uppercase tracking-wide opacity-80">Today's Chemistry</p>
            <p className="mt-1 font-serif text-3xl leading-tight">Who's your café match today?</p>
            <p className="mt-2 text-sm opacity-80">Four quick taps and we'll pour you a fresh batch.</p>
            <button onClick={() => setStage("checkin")} className="mt-4 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground">Start my check-in ☕</button>
          </section>
          {pending && <YesterdayCard key={pending.at} entry={pending} onRate={(r, c) => rate(pending, r, c)} />}
          <RekindleList perks={loyalty.perks.filter((p) => p.expires > clock)} />
          <DealsCarousel deals={deals} minutesNow={nowMin} onClaim={claim} />
          <ChallengesSection list={getChallenges(loyalty.visits, CAFES, clock)} />
          <LovedByFriends ids={lovedByFriends(loyalty)} />
          <PassportPreview stamps={stampList} badges={badgeList} />
        </div>
      )}
      {stage === "brewing" && <Brewing />}
      {stage === "deck" && <Deck cards={cards} onMatch={onMatch} onPass={onPass} />}
      {match && <MatchModal card={match} claimed={claimed} onClose={() => setMatch(null)} onChat={() => { setChatCard(match); setMatch(null); }} onCheckIn={() => setQrFor(match)} />}
      {qrFor && <CheckInQR cafeId={qrFor.cafeId} doubleBeans={!!qrFor.offer} onScan={() => scan(qrFor)} onClose={() => setQrFor(null)} />}
      {rain && <BeanRain earned={rain.earned} messages={rain.messages} onDone={() => setRain(null)} />}
      {redeemOpen && <RedeemSheet beans={beans} code={redeemCode} onRedeem={doRedeem} onClose={() => setRedeemOpen(false)} />}
      {stage !== "onboarding" && stage !== "brewing" && <BottomTabs active={stage === "home" ? "home" : "match"} onMatch={() => setStage(cards.length ? "deck" : "checkin")} />}
      {chatCard && <CafeChat card={chatCard} profile={profile} onClose={() => setChatCard(null)} />}
      {celebrate && <Celebration text={celebrate} onDone={() => setCelebrate(null)} />}
    </main>
  );
}
