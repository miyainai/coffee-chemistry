import { useEffect, useState } from "react";

const LINES = ["Grinding the beans…", "Steaming the oat milk…", "Finding quiet corners with plugs…", "Matching flavor profiles…"];

export function Brewing() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % LINES.length), 1400); return () => clearInterval(t); }, []);
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="relative h-48 w-40">
        <div className="animate-pour absolute left-1/2 top-0 h-20 w-2 -translate-x-1/2 rounded-full bg-primary" />
        <div className="absolute bottom-0 left-1/2 h-28 w-28 -translate-x-1/2 overflow-hidden rounded-b-[2.5rem] border-4 border-primary bg-card">
          <div className="animate-fill absolute bottom-0 w-full bg-accent" />
        </div>
        <div className="absolute bottom-6 right-0 h-12 w-8 rounded-r-full border-4 border-l-0 border-primary" />
        <span className="animate-steam absolute left-8 top-14 text-muted-foreground">~</span>
        <span className="animate-steam absolute right-10 top-12 text-muted-foreground [animation-delay:.7s]">~</span>
      </div>
      <h2 className="mt-10 font-serif text-3xl">Brewing your matches…</h2>
      <p key={i} className="animate-slide-in mt-2 text-muted-foreground">{LINES[i]}</p>
    </div>
  );
}
