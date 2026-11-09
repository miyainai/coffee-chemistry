import { useState } from "react";
import type { Profile } from "@/lib/reco/types";

type Step = { title: string; key: "milk" | "usualOrder" | "caffeineTolerance" | "budget"; options: [string, string][] };

const STEPS: Step[] = [
  { title: "How do you take it?", key: "milk", options: [["whole", "🥛 Whole"], ["oat", "🌾 Oat"], ["almond", "🌰 Almond"], ["black", "☕ Black, no milk"]] },
  { title: "Your usual order?", key: "usualOrder", options: [["Americano", "Americano"], ["Latte", "Latte"], ["Cappuccino", "Cappuccino"], ["Cold brew", "Cold brew"], ["Matcha", "Matcha"], ["Surprise me", "✨ Surprise me"]] },
  { title: "Caffeine tolerance?", key: "caffeineTolerance", options: [["sensitive", "One sip and I'm vibrating"], ["normal", "Normal human"], ["high", "Espresso runs in my veins"]] },
  { title: "Budget per cup?", key: "budget", options: [["1", "$"], ["2", "$$"], ["3", "$$$"]] },
];

export function Onboarding({ profile, onDone }: { profile: Profile; onDone: (p: Profile) => void }) {
  const [i, setI] = useState(0);
  const [p, setP] = useState<Profile>(profile);
  const step = STEPS[i]!;

  function choose(v: string) {
    const next: Profile = { ...p };
    if (step.key === "milk") { next.milk = v as Profile["milk"]; next.needsNonDairy = v === "oat" || v === "almond"; }
    if (step.key === "usualOrder") next.usualOrder = v;
    if (step.key === "caffeineTolerance") { next.caffeineTolerance = v as Profile["caffeineTolerance"]; next.caffeineSensitive = v === "sensitive"; }
    if (step.key === "budget") next.budget = Number(v);
    setP(next);
    if (i < STEPS.length - 1) setI(i + 1); else onDone(next);
  }

  return (
    <div className="flex min-h-[80vh] flex-col">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Let's get to know your cup</p>
        <button onClick={() => onDone(p)} className="text-sm text-muted-foreground underline-offset-4 hover:underline">Skip</button>
      </div>
      <Dots n={STEPS.length} i={i} />
      <div key={i} className="animate-slide-in mt-10 flex-1">
        <h2 className="font-serif text-4xl leading-tight">{step.title}</h2>
        <div className="mt-8 grid gap-3">
          {step.options.map(([v, l]) => (
            <button key={v} onClick={() => choose(v)} className="rounded-2xl border bg-card px-5 py-4 text-left text-lg transition hover:border-accent hover:bg-secondary">{l}</button>
          ))}
        </div>
      </div>
      {i > 0 && <button onClick={() => setI(i - 1)} className="mt-6 self-start text-sm text-muted-foreground">← Back</button>}
    </div>
  );
}

export function Dots({ n, i }: { n: number; i: number }) {
  return (
    <div className="mt-4 flex gap-1.5">
      {Array.from({ length: n }, (_, k) => (
        <span key={k} className={`h-1.5 flex-1 rounded-full transition ${k <= i ? "bg-accent" : "bg-border"}`} />
      ))}
    </div>
  );
}
