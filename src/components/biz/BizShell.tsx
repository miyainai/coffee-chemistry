import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function BizShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <Link to="/" className="font-serif text-lg font-semibold text-primary">Coffee Chemistry</Link>
          <nav className="flex gap-1 text-sm">
            <Link to="/shop" className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-muted" activeProps={{ className: "bg-primary text-primary-foreground" }}>For cafés</Link>
            <Link to="/admin" className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-muted" activeProps={{ className: "bg-primary text-primary-foreground" }}>Our business</Link>
          </nav>
          <span className="ml-auto rounded-full bg-offer px-3 py-1 text-xs font-semibold text-offer-foreground">Demo data</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border bg-card p-5 ${className}`}>
      {title && <h2 className="mb-4 font-serif text-lg text-foreground">{title}</h2>}
      {children}
    </section>
  );
}

export function Kpi({ label, value, highlight, tone }: { label: string; value: string; highlight?: boolean; tone?: "good" | "bad" | undefined }) {
  const cls = highlight ? "bg-primary text-primary-foreground" : "bg-card text-foreground";
  const toneCls = tone === "good" ? "text-chart-2" : tone === "bad" ? "text-destructive" : "";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className={`text-xs uppercase tracking-wide ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{label}</div>
      <div className={`mt-1 font-serif ${highlight ? "text-4xl" : "text-2xl"} ${toneCls}`}>{value}</div>
    </div>
  );
}

export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const pct = (n: number) => `${Math.round(n * 100)}%`;
