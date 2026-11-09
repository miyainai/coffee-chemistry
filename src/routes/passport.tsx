import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { seedIfNeeded } from "@/lib/reco/seed";
import { saveHistory, loadHistory, type MatchEntry } from "@/lib/reco/history";
import { CAFES } from "@/lib/reco/cafes";
import { badges as getBadges, stamps as getStamps, type Badge, type Stamp } from "@/lib/reco/passport";
import { BadgeTile, StampBadge } from "@/components/coffee/HomeSections";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "Café Passport — Coffee Chemistry" },
      { name: "description", content: "Neighborhood stamps and badges from every café you've visited." },
      { property: "og:title", content: "Café Passport — Coffee Chemistry" },
      { property: "og:description", content: "Collect neighborhood stamps and coffee badges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Passport,
});

function css(name: string) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

/** Draws a 1080x1920 story card of stamps and badges. */
function drawStory(stamps: Stamp[], badges: Badge[]) {
  const c = document.createElement("canvas"); c.width = 1080; c.height = 1920;
  const g = c.getContext("2d")!;
  const bg = css("--background"), fg = css("--foreground"), primary = css("--primary"), offer = css("--offer");
  g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
  g.fillStyle = fg; g.textAlign = "center";
  g.font = "italic 64px Georgia, serif"; g.fillText("My Café Passport", 540, 200);
  g.font = "36px sans-serif"; g.fillText(`${stamps.length} stamps · ${badges.filter((b) => b.unlocked).length} badges`, 540, 270);
  stamps.slice(0, 6).forEach((s, i) => {
    const x = 270 + (i % 2) * 540, y = 520 + Math.floor(i / 2) * 340, pct = s.total ? s.explored / s.total : 0;
    g.fillStyle = offer; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 140, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2); g.fill();
    g.strokeStyle = primary; g.lineWidth = 8; g.setLineDash([18, 10]); g.beginPath(); g.arc(x, y, 140, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.fillStyle = bg; g.beginPath(); g.arc(x, y, 108, 0, Math.PI * 2); g.fill(); g.lineWidth = 4; g.stroke();
    g.fillStyle = primary; g.font = "bold 30px Georgia, serif"; s.neighborhood.toUpperCase().split(" ").forEach((w, j, a) => g.fillText(w, x, y + 10 + (j - (a.length - 1) / 2) * 36));
    g.fillStyle = fg; g.font = "28px sans-serif"; g.fillText(`${s.explored}/${s.total} explored`, x, y + 190);
  });
  const top = 1560;
  badges.forEach((b, i) => {
    const x = 140 + i * 160; g.globalAlpha = b.unlocked ? 1 : 0.25;
    g.font = "90px serif"; g.fillText(b.emoji, x, top);
    g.globalAlpha = 1;
  });
  g.fillStyle = fg; g.font = "italic 44px Georgia, serif"; g.fillText("Coffee Chemistry ☕", 540, 1800);
  return c;
}

function Passport() {
  const [h, setH] = useState<MatchEntry[]>([]);
  useEffect(() => { const l = loadHistory(); const sd = seedIfNeeded(l); if (sd) saveHistory(sd); setH(sd ?? l); }, []);
  const stamps = getStamps(h, CAFES), badges = getBadges(h);

  async function share() {
    const blob = await new Promise<Blob | null>((r) => drawStory(stamps, badges).toBlob(r, "image/png"));
    if (!blob) return;
    const file = new File([blob], "cafe-passport.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: "My Café Passport" }); return; } catch { /* fall through to download */ } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-10 pt-5 font-sans">
      <header className="mb-5 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl">Coffee Chemistry</Link>
        <Link to="/profile" className="text-sm font-medium">Profile</Link>
      </header>
      <h1 className="font-serif text-4xl">🛂 Café Passport</h1>
      <p className="mt-1 text-muted-foreground">{stamps.length} stamps · {badges.filter((b) => b.unlocked).length} badges</p>
      <h2 className="mt-6 font-serif text-xl">Neighborhood stamps</h2>
      {stamps.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Rate a visit to earn your first stamp.</p> : (
        <div className="mt-3 grid grid-cols-2 gap-5">{stamps.map((s) => <StampBadge key={s.neighborhood} s={s} />)}</div>
      )}
      <h2 className="mt-8 font-serif text-xl">Badges</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">{badges.map((b) => <BadgeTile key={b.id} b={b} />)}</div>
      <button onClick={share} className="mt-8 w-full rounded-full bg-primary py-3 text-primary-foreground">Share my passport</button>
    </main>
  );
}
