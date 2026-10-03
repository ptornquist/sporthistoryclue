"use client";

import { useEffect, useState } from "react";

export const TUTORIAL_SEEN_KEY = "shc_tutorial_seen";
export const HOW_TO_PLAY_EVENT = "shc-open-how-to-play";

const STEPS = [
  {
    icon: "🃏",
    title: "Deducera matchen kort för kort",
    body: "Lås upp ledtrådarna ett kort i taget och identifiera den historiska matchen.",
  },
  {
    icon: "📉",
    title: "Varje extra ledtråd kostar 1 500 poäng",
    body: "Första kortet är gratis. Varje nästa kort drar −1 500 poäng från startpotten.",
  },
  {
    icon: "🏆",
    title: "Lös matchen och klättra",
    body: "Rätt svar ger poäng så du klättrar i ligan och kan utmana vänner.",
  },
] as const;

export function hasSeenTutorial(value: string | null): boolean {
  return value === "true";
}

export function requestHowToPlay(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(HOW_TO_PLAY_EVENT));
}

export function HowToPlayModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-play-title"
        className="relative bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 max-w-lg shadow-2xl z-50 text-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng så spelar du"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
        >
          ✕
        </button>
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">Scoutbriefing</p>
        <h2 id="how-to-play-title" className="mt-1 text-2xl font-black uppercase tracking-tight">
          Så spelar du
        </h2>
        <div className="mt-5 space-y-3">
          {STEPS.map((step) => (
            <article key={step.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-sm font-black text-zinc-900">
                <span aria-hidden>{step.icon} </span>
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">{step.body}</p>
            </article>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-sm tracking-wider uppercase shadow-md transition-all"
        >
          Gå in i arenan →
        </button>
      </div>
    </div>
  );
}

export function rememberTutorialSeen(): void {
  try {
    window.localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
  } catch {
    // Private browsing can block storage; the modal still closes.
  }
}

export function FirstVisitBriefing() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(HOW_TO_PLAY_EVENT, show);
    const timer = window.setTimeout(() => {
      try {
        if (!hasSeenTutorial(window.localStorage.getItem(TUTORIAL_SEEN_KEY))) setOpen(true);
      } catch {
        setOpen(true);
      }
    }, 400);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(HOW_TO_PLAY_EVENT, show);
    };
  }, []);

  return (
    <HowToPlayModal
      open={open}
      onClose={() => {
        rememberTutorialSeen();
        setOpen(false);
      }}
    />
  );
}
