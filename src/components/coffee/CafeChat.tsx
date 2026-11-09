import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Send } from "lucide-react";
import { baristaChat } from "@/lib/reco/reco.functions";
import type { Profile, RecoCard } from "@/lib/reco/types";
import { photosFor } from "./Deck";

type Msg = { role: "user" | "assistant"; content: string };
const STARTERS = ["What should I order?", "Make it less sweet", "I got it — here's my review", "Anything non-dairy?"];

export function CafeChat({ card, profile, onClose }: { card: RecoCard; profile: Profile; onClose: () => void }) {
  const chat = useServerFn(baristaChat);
  const storeKey = `cc-chat-${card.cafeId}`;
  const greeting: Msg = { role: "assistant", content: `Hey you 👋 It's ${card.name} — we think the ${card.heroDrink} is your type — want to talk it through, or tell me what you ended up getting?` };
  const [msgs, setMsgs] = useState<Msg[]>([greeting]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { const s = localStorage.getItem(storeKey); if (s) setMsgs(JSON.parse(s)); input.current?.focus(); }, [storeKey]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send(content: string) {
    const c = content.trim(); if (!c || busy) return;
    const next = [...msgs, { role: "user" as const, content: c }];
    setMsgs(next); setText(""); setBusy(true); setErr(null);
    try {
      const r = await chat({ data: { cafeId: card.cafeId, matchedDrink: card.heroDrink, profile: { milk: profile.milk, usualOrder: profile.usualOrder, caffeineTolerance: profile.caffeineTolerance, budget: profile.budget }, messages: next.slice(1).slice(-30) } });
      if (r.reply) { const done = [...next, { role: "assistant" as const, content: r.reply }]; setMsgs(done); localStorage.setItem(storeKey, JSON.stringify(done)); }
      else setErr(r.error ?? "Something went wrong.");
    } catch { setErr("The barista stepped away for a sec. Try again in a moment."); }
    setBusy(false); input.current?.focus();
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      <header className="mx-auto flex w-full max-w-md items-center gap-3 border-b px-4 py-3">
        <button onClick={onClose} aria-label="Back"><ArrowLeft /></button>
        <img src={photosFor(card.cafeId)[0]} alt="" className="h-10 w-10 rounded-full object-cover" />
        <div><p className="font-serif text-lg leading-tight">{card.name}</p><p className="text-xs text-muted-foreground">You matched · {card.neighborhood}</p></div>
      </header>
      <div className="mx-auto w-full max-w-md flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
            <p className={`max-w-[80%] whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>{m.content}</p>
          </div>
        ))}
        {busy && <p className="w-16 rounded-3xl bg-card px-4 py-2.5 text-center text-sm animate-pulse">•••</p>}
        {err && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
        <div ref={end} />
      </div>
      <div className="mx-auto w-full max-w-md px-4 pb-4">
        {msgs.length < 3 && (
          <div className="mb-2 flex gap-2 overflow-x-auto">
            {STARTERS.map((s) => <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border px-3 py-1 text-xs">{s}</button>)}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-2 rounded-3xl border bg-card p-2">
          <textarea ref={input} value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Ask about drinks or share how it went…"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none" />
          <button disabled={busy || !text.trim()} aria-label="Send" className="rounded-full bg-primary p-2.5 text-primary-foreground disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}
