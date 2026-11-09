import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BizShell, Kpi, Panel, pct, usd } from "@/components/biz/BizShell";
import { DEMAND, SHOPS, neighborhoodAvg } from "@/lib/biz/seed";
import { cafeSpend, roiMultiple } from "@/lib/biz/economics";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fmtMin } from "@/lib/reco/engine";
import type { Plan } from "@/lib/reco/types";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "For cafés — Coffee Chemistry" },
      { name: "description", content: "See the customers, visits and return on spend Coffee Chemistry brings your café." },
      { property: "og:title", content: "For cafés — Coffee Chemistry" },
      { property: "og:description", content: "Café owner dashboard: matches, verified visits and ROI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

type NewOffer = { text: string; startMin: number; endMin: number; purposes: Plan[]; code: string; redemptions: number; cost: number; revenue: number; seats: number };
const PURPOSE: Record<string, Plan> = { Work: "work", Social: "catchup", "Grab & go": "grab" };

function ShopPage() {
  const [id, setId] = useState(SHOPS[0]!.id);
  const s = SHOPS.find((x) => x.id === id)!;
  const [promo, setPromo] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<Record<string, NewOffer[]>>({});
  const [form, setForm] = useState({ start: "14:00", end: "17:00", text: "", purpose: "Work" });
  const promoted = promo[id] ?? s.promoted;
  const spend = cafeSpend({ promotedMatches: promoted ? s.matches : 0, visits: s.visits, pro: s.pro });
  const roi = roiMultiple(s.revenue, spend);
  const avg = neighborhoodAvg(s.neighborhood);
  const offers = [...s.offers, ...(added[id] ?? [])];
  const funnel = [
    { label: "Shown", n: s.views, rate: 1, avg: 1 },
    { label: "Matched", n: s.matches, rate: s.matches / s.views, avg: avg.matched },
    { label: "Visited", n: s.visits, rate: s.visits / s.matches, avg: avg.visited },
    { label: "Returned", n: s.returned, rate: s.returned / s.visits, avg: avg.returned },
  ];
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return (h ?? 0) * 60 + (m ?? 0); };

  return (
    <BizShell title="What a café gets" subtitle="Last 30 days of customers Coffee Chemistry sent your way.">
      <label className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Viewing as:</span>
        <select value={id} onChange={(e) => setId(e.target.value)} className="rounded-full border bg-card px-4 py-2 font-medium">
          {SHOPS.map((x) => <option key={x.id} value={x.id}>{x.name}, {x.neighborhood}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Kpi label="Views" value={s.views.toLocaleString()} />
        <Kpi label="Matches" value={s.matches.toLocaleString()} />
        <Kpi label="Verified visits" value={s.visits.toLocaleString()} />
        <Kpi label="New customers" value={s.newCustomers.toLocaleString()} />
        <Kpi label="Revenue generated" value={usd(s.revenue)} />
        <Kpi label="Spend on us" value={usd(spend)} />
        <Kpi label="Return" value={`${roi.toFixed(1)}x`} highlight tone={roi < 3 ? "bad" : undefined} />
      </div>

      <Panel title="Customer funnel">
        <div className="grid grid-cols-4 gap-2">
          {funnel.map((f, i) => (
            <div key={f.label} className="rounded-xl bg-muted p-4" style={{ opacity: 1 - i * 0.12 }}>
              <div className="text-xs uppercase text-muted-foreground">{f.label}</div>
              <div className="font-serif text-2xl">{f.n.toLocaleString()}</div>
              {i > 0 && <div className="text-sm"><b>{pct(f.rate)}</b> <span className="text-muted-foreground">· area avg {pct(f.avg)}</span></div>}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Why people passed on you">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={s.passes} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="reason" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="What people nearby want">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr><th className="py-1">Time</th><th>Purpose</th><th>Mood</th><th>Drink</th></tr></thead>
            <tbody>{DEMAND.map((d) => <tr key={d.time} className="border-t"><td className="py-2 font-medium">{d.time}</td><td>{d.purpose}</td><td>{d.mood}</td><td>{d.drink}</td></tr>)}</tbody>
          </table>
        </Panel>
        <Panel title="Who's coming">
          <div className="grid grid-cols-5 gap-2 text-center">
            {s.segments.map((g) => <div key={g.label} className="rounded-xl bg-muted p-3"><div className="font-serif text-2xl">{g.count}</div><div className="text-xs text-muted-foreground">{g.label}</div></div>)}
          </div>
        </Panel>
        <Panel title="What they said">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><div className="mb-2 font-semibold">😍 Hits</div>{s.hits.map((h) => <div key={h} className="mb-1 rounded-full bg-muted px-3 py-1">{h}</div>)}</div>
            <div><div className="mb-2 font-semibold">😕 Misses</div>{s.misses.map((h) => <div key={h} className="mb-1 rounded-full border px-3 py-1">{h}</div>)}</div>
          </div>
        </Panel>
      </div>

      <Panel title="Offers & promotion">
        <div className="mb-5 flex items-center gap-3">
          <Switch checked={promoted} onCheckedChange={(v) => setPromo({ ...promo, [id]: v })} />
          <span className="text-sm">Promoted placement <span className="text-muted-foreground">($0.50 per match)</span></span>
        </div>
        <form className="mb-5 grid gap-2 md:grid-cols-[auto_auto_1fr_auto_auto]" onSubmit={(e) => {
          e.preventDefault();
          if (!form.text.trim()) return;
          const o: NewOffer = { text: form.text, startMin: toMin(form.start), endMin: toMin(form.end), purposes: [PURPOSE[form.purpose]!], code: `BREW${Math.floor(Math.random() * 90 + 10)}`, redemptions: 0, cost: 0, revenue: 0, seats: 0 };
          setAdded({ ...added, [id]: [...(added[id] ?? []), o] });
          setForm({ ...form, text: "" });
        }}>
          <Input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          <Input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          <Input placeholder="e.g. Free refill for laptop folks" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="rounded-md border bg-card px-3">
            {Object.keys(PURPOSE).map((p) => <option key={p}>{p}</option>)}
          </select>
          <Button type="submit">Create offer</Button>
        </form>
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th className="py-1">Offer</th><th>Window</th><th>Redemptions</th><th>Cost to café</th><th>Revenue</th><th>Seats filled 2–5 PM</th></tr></thead>
          <tbody>
            {offers.length === 0 && <tr><td colSpan={6} className="py-3 text-muted-foreground">No offers yet — create one above to fill dead hours.</td></tr>}
            {offers.map((o) => <tr key={o.code} className="border-t"><td className="py-2">{o.text}</td><td>{fmtMin(o.startMin)}–{fmtMin(o.endMin)}</td><td>{o.redemptions}</td><td>{usd(o.cost)}</td><td>{usd(o.revenue)}</td><td>{o.seats}</td></tr>)}
          </tbody>
        </table>
      </Panel>
    </BizShell>
  );
}
