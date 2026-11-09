import { useState } from "react";
import type { CheckIn } from "@/lib/reco/types";
import { Dots } from "./Onboarding";

const MOODS: [CheckIn["mood"], string, string][] = [["cozy", "☁️", "Cozy"], ["refreshing", "🧊", "Refreshing"], ["indulgent", "🍫", "Indulgent"], ["clean", "✨", "Clean & simple"]];
const PLANS: [CheckIn["plan"], string, string][] = [["grab", "🏃", "Grab & go"], ["work", "💻", "Lock in and work"], ["catchup", "👯", "Catch up with someone"], ["treat", "🎀", "Treat myself"]];
const DIST: [CheckIn["distance"], string, string][] = [["5", "🚶", "5 min"], ["15", "🚶‍♀️", "15 min"], ["trip", "🚇", "Worth the trip"]];
const DUR: [NonNullable<CheckIn["duration"]>, string][] = [["1h", "1 hr"], ["2-3h", "2–3 hrs"], ["allday", "All day"]];

export function CheckInFlow({ onSubmit }: { onSubmit: (c: CheckIn) => void }) {
  const [i, setI] = useState(0);
  const [c, setC] = useState<CheckIn>({ battery: 50, mood: "cozy", plan: "grab", distance: "15", note: "" });
  const [askDur, setAskDur] = useState(false);
  const next = () => setI((v) => v + 1);

  const Big = ({ items, value, onPick }: { items: [string, string, string][]; value: string; onPick: (v: string) => void }) => (
    <div className="mt-8 grid grid-cols-2 gap-3">
      {items.map(([v, e, l]) => (
        <button key={v} onClick={() => onPick(v)} className={`flex aspect-[4/3] flex-col justify-between rounded-3xl border p-4 text-left transition hover:border-accent ${value === v ? "border-accent bg-secondary" : "bg-card"}`}>
          <span className="text-3xl">{e}</span><span className="text-base font-medium">{l}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-[80vh] flex-col">
      <p className="text-sm text-muted-foreground">Today's Chemistry Check</p>
      <Dots n={5} i={i} />
      <div key={i + (askDur ? "d" : "")} className="animate-slide-in mt-10 flex-1">
        {i === 0 && (
          <>
            <h2 className="font-serif text-4xl leading-tight">How's your battery today?</h2>
            <div className="mt-14 text-center text-6xl">{c.battery < 34 ? "🪫" : c.battery < 67 ? "🔋" : "⚡"}</div>
            <input type="range" min={0} max={100} value={c.battery} onChange={(e) => setC({ ...c, battery: +e.target.value })} className="mt-8 w-full accent-[var(--accent)]" aria-label="Battery" />
            <div className="mt-2 flex justify-between text-sm text-muted-foreground"><span>🪫 Running on fumes</span><span>🔋 Fully charged</span></div>
            <button onClick={next} className="mt-12 w-full rounded-full bg-primary py-4 text-primary-foreground">Next</button>
          </>
        )}
        {i === 1 && (<><h2 className="font-serif text-4xl leading-tight">What's your mood calling for?</h2><Big items={MOODS} value={c.mood} onPick={(v) => { setC({ ...c, mood: v as CheckIn["mood"] }); next(); }} /></>)}
        {i === 2 && !askDur && (
          <><h2 className="font-serif text-4xl leading-tight">What's the plan?</h2>
            <Big items={PLANS} value={c.plan} onPick={(v) => { const plan = v as CheckIn["plan"]; setC({ ...c, plan, duration: plan === "work" ? c.duration : undefined }); if (plan === "work") setAskDur(true); else next(); }} /></>
        )}
        {i === 2 && askDur && (
          <><h2 className="font-serif text-4xl leading-tight">For how long?</h2>
            <div className="mt-8 grid gap-3">
              {DUR.map(([v, l]) => <button key={v} onClick={() => { setC({ ...c, duration: v }); setAskDur(false); next(); }} className="rounded-2xl border bg-card px-5 py-4 text-left text-lg hover:border-accent">{l}</button>)}
            </div></>
        )}
        {i === 3 && (<><h2 className="font-serif text-4xl leading-tight">How far will you go?</h2><Big items={DIST} value={c.distance} onPick={(v) => { setC({ ...c, distance: v as CheckIn["distance"] }); next(); }} /></>)}
        {i === 4 && (
          <>
            <h2 className="font-serif text-4xl leading-tight">Anything else? Spill the beans ☕</h2>
            <div className="mt-8 rounded-3xl rounded-bl-md border bg-card p-4">
              <textarea rows={4} maxLength={300} value={c.note} onChange={(e) => setC({ ...c, note: e.target.value })} placeholder="e.g. low social battery, big presentation at 2" className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-muted-foreground" />
            </div>
            <button onClick={() => onSubmit(c)} className="mt-8 w-full rounded-full bg-primary py-4 text-lg text-primary-foreground">Find my match</button>
            <button onClick={() => onSubmit({ ...c, note: "" })} className="mt-3 w-full py-2 text-muted-foreground">Skip</button>
          </>
        )}
      </div>
      {i > 0 && <button onClick={() => (askDur ? setAskDur(false) : setI(i - 1))} className="mt-6 self-start text-sm text-muted-foreground">← Back</button>}
    </div>
  );
}
