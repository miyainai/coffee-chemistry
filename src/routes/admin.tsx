import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BizShell, Kpi, Panel, usd } from "@/components/biz/BizShell";
import { PLATFORM_WEEKS, SHOPS } from "@/lib/biz/seed";
import { DEFAULT_ASSUMPTIONS, arpc, ltv, ltvCac, monthlyRevenue, project12, PRO_PRICE_USD, type Assumptions } from "@/lib/biz/economics";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "How we make money — Coffee Chemistry" },
      { name: "description", content: "Coffee Chemistry revenue streams, unit economics and a live revenue projection." },
      { property: "og:title", content: "How we make money — Coffee Chemistry" },
      { property: "og:description", content: "Revenue streams, unit economics and assumptions playground." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const SLIDERS: { key: keyof Assumptions; label: string; min: number; max: number; step: number; fmt: (n: number) => string }[] = [
  { key: "cafes", label: "Cafés onboarded", min: 10, max: 1000, step: 10, fmt: (n) => `${n}` },
  { key: "pctPaying", label: "% paying", min: 5, max: 100, step: 5, fmt: (n) => `${n}%` },
  { key: "matchesPerCafe", label: "Matches per café / month", min: 20, max: 600, step: 10, fmt: (n) => `${n}` },
  { key: "feePerMatch", label: "Fee per match", min: 0.1, max: 2, step: 0.1, fmt: (n) => `$${n.toFixed(2)}` },
  { key: "feePerVisit", label: "Fee per visit", min: 0.5, max: 5, step: 0.25, fmt: (n) => `$${n.toFixed(2)}` },
  { key: "proPrice", label: "Pro price / month", min: 19, max: 199, step: 10, fmt: (n) => `$${n}` },
  { key: "cac", label: "Acquisition cost per café", min: 25, max: 600, step: 25, fmt: (n) => `$${n}` },
];

function AdminPage() {
  const [a, setA] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const last = PLATFORM_WEEKS[PLATFORM_WEEKS.length - 1]!;
  const paying = SHOPS.filter((s) => s.promoted || s.pro).length;
  const mrr = SHOPS.filter((s) => s.pro).length * PRO_PRICE_USD;
  const total = (last.promoted + last.visits + last.pro) * 4.33;
  const seedA: Assumptions = { ...a, cafes: SHOPS.length, pctPaying: (paying / SHOPS.length) * 100 };
  const ratio = ltvCac(a), seedRatio = ltvCac(seedA);
  const C = { promoted: "var(--primary)", visits: "var(--offer)", pro: "var(--muted-foreground)" };

  return (
    <BizShell title="How Coffee Chemistry makes money" subtitle="Cafés pay only when we deliver customers — plus an optional Pro tier.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Cafés onboarded" value={`${SHOPS.length}`} />
        <Kpi label="Paying cafés" value={`${paying}`} />
        <Kpi label="Recurring revenue / mo" value={usd(mrr)} />
        <Kpi label="Total revenue / mo" value={usd(total)} highlight />
      </div>

      <Panel title="Revenue by stream — last 8 weeks">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={PLATFORM_WEEKS}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" /><YAxis tickFormatter={(v) => `$${v}`} /><Tooltip formatter={(v: number) => usd(v)} /><Legend />
            <Bar dataKey="promoted" name="Promoted matches ($0.50)" stackId="a" fill={C.promoted} />
            <Bar dataKey="visits" name="Pay-per-visit ($1.50)" stackId="a" fill={C.visits} />
            <Bar dataKey="pro" name="Pro ($79/mo)" stackId="a" fill={C.pro} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Unit economics">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Kpi label="Café acquisition cost" value={usd(a.cac)} />
          <Kpi label="Avg revenue / café / mo" value={usd(arpc(seedA))} />
          <Kpi label="Café lifetime value" value={usd(ltv(seedA))} />
          <Kpi label="LTV : CAC" value={`${seedRatio.toFixed(1)}x`} tone={seedRatio > 3 ? "good" : "bad"} />
          <Kpi label="Monthly café churn" value="6%" />
        </div>
      </Panel>

      <Panel title="Assumptions playground">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-5">
            {SLIDERS.map((s) => (
              <div key={s.key}>
                <div className="mb-2 flex justify-between text-sm"><span>{s.label}</span><b>{s.fmt(a[s.key] as number)}</b></div>
                <Slider min={s.min} max={s.max} step={s.step} value={[a[s.key] as number]} onValueChange={([v]) => setA({ ...a, [s.key]: v })} />
              </div>
            ))}
            <button className="text-sm text-muted-foreground underline" onClick={() => setA(DEFAULT_ASSUMPTIONS)}>Reset to default scenario</button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Kpi label="Monthly revenue" value={usd(monthlyRevenue(a))} />
              <Kpi label="Annual revenue" value={usd(monthlyRevenue(a) * 12)} />
              <Kpi label="LTV : CAC" value={`${ratio.toFixed(1)}x`} tone={ratio > 3 ? "good" : "bad"} highlight />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={project12(a)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" /><YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} /><Tooltip formatter={(v: number) => usd(v)} />
                <Line type="monotone" dataKey="revenue" name="Monthly revenue" stroke="var(--primary)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground">Assumes 30% of matches become verified visits, 25% of paying cafés on Pro, 6% monthly churn and 8% monthly café growth.</p>
          </div>
        </div>
      </Panel>
    </BizShell>
  );
}
