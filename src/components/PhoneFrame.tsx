import { useEffect, useState, type ReactNode } from "react";

/**
 * Demo-only iPhone 15 Pro frame. On screens wider than 500px the app renders
 * inside a 390x844 CSS phone; on narrow screens the app renders untouched.
 * The wrapper's transform makes it a containing block, so the app's
 * position:fixed elements (bottom nav, modals) stay inside the screen.
 */

const W = 390;
const H = 844;
const BEZEL = 14; // black bezel thickness
const OUTER_H = H + BEZEL * 2;

function usePhoneMode() {
  const [on, setOn] = useState(false);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 501px)");
    const update = () => {
      setOn(mq.matches);
      setScale(Math.min(1, (window.innerHeight - 32) / OUTER_H));
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return { on, scale };
}

function StatusBar() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between px-7 pt-4 text-foreground"
      aria-hidden
    >
      <span className="text-[13px] font-semibold tracking-wide">9:41</span>
      <span className="flex items-center gap-1.5">
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="0.8" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.8" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.8" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.8" />
        </svg>
        {/* wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
          <path d="M7.5 10.2 5.6 8.1a2.7 2.7 0 0 1 3.8 0L7.5 10.2Z" />
          <path d="M3.4 6a6 6 0 0 1 8.2 0l-1.4 1.5a3.9 3.9 0 0 0-5.4 0L3.4 6Z" />
          <path d="M1.2 3.8a9.3 9.3 0 0 1 12.6 0l-1.4 1.5a7.2 7.2 0 0 0-9.8 0L1.2 3.8Z" />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="15" height="8" rx="1.6" fill="currentColor" />
          <path d="M22.5 4v4a2.2 2.2 0 0 0 0-4Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  const { on, scale } = usePhoneMode();

  if (!on) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      {/* wrapper reserves the scaled footprint so a short window never clips the phone */}
      <div
        className="relative"
        style={{ width: (W + BEZEL * 2) * scale, height: OUTER_H * scale }}
      >
        <div
          className="absolute left-0 top-0"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
        {/* device body */}
        <div
          className="relative rounded-[56px] bg-neutral-950 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.55)] ring-1 ring-neutral-700"
          style={{ width: W + BEZEL * 2, height: OUTER_H, padding: BEZEL }}
        >
          {/* side buttons */}
          <div className="absolute -left-[2px] top-28 h-8 w-[3px] rounded-l bg-neutral-700" />
          <div className="absolute -left-[2px] top-44 h-14 w-[3px] rounded-l bg-neutral-700" />
          <div className="absolute -left-[2px] top-60 h-14 w-[3px] rounded-l bg-neutral-700" />
          <div className="absolute -right-[2px] top-48 h-20 w-[3px] rounded-r bg-neutral-700" />

          {/* screen — translateZ(0) makes it the containing block for the app's
              position:fixed elements (bottom nav, modals), keeping them inside */}
          <div
            className="relative overflow-hidden rounded-[44px] bg-background"
            style={{ width: W, height: H, transform: "translateZ(0)" }}
          >
            {/* Dynamic Island */}
            <div className="pointer-events-none absolute left-1/2 top-3 z-50 h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-neutral-950" />

            <StatusBar />

            {/* app scrolls inside the screen only */}
            <div className="h-full w-full overflow-y-auto overflow-x-hidden pt-12 pb-6">
              {children}
            </div>

            {/* home indicator */}
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-40 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/70" />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
