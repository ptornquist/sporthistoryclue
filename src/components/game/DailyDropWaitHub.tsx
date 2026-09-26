"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Timer } from "lucide-react";
import {
  activeStreak,
  formatCountdown,
  msUntilNextUtcMidnight,
  utcDateKey,
  weekDateKeys,
  weekdayLabels,
} from "@/lib/utc-streak";

const CLOCK_PLACEHOLDER = "-- : -- : --";

function useMidnightLabel(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      const id = window.setInterval(onStoreChange, 1000);
      return () => window.clearInterval(id);
    },
    () => formatCountdown(msUntilNextUtcMidnight(new Date())),
    () => CLOCK_PLACEHOLDER,
  );
}

function useUtcToday(): string | null {
  return useSyncExternalStore(
    () => () => {},
    () => utcDateKey(new Date()),
    () => null,
  );
}

function MidnightCountdown() {
  const label = useMidnightLabel();

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-center shadow-sm">
      <p className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
        <Timer className="h-4 w-4 text-blue-600" aria-hidden="true" />
        Next Daily Drop In
      </p>
      <p
        className="mt-3 text-3xl sm:text-4xl font-black tracking-wider text-blue-600 font-mono tabular-nums"
        suppressHydrationWarning
      >
        {label}
      </p>
    </div>
  );
}

function WeekStreakGrid({ solvedDates, streak }: { solvedDates: string[]; streak: number }) {
  const todayKey = useUtcToday();

  const labels = weekdayLabels();
  const days = todayKey ? weekDateKeys(todayKey) : labels.map((_, index) => `slot-${index}`);
  const solved = new Set(solvedDates);
  const shownStreak = todayKey ? activeStreak(solvedDates, todayKey) : streak;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-center shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">This Week</p>
      <div className="mt-4 flex items-start justify-between gap-1">
        {days.map((key, index) => {
          const isToday = todayKey !== null && key === todayKey;
          const isSolved = todayKey !== null && solved.has(key);
          const label = labels[index];

          if (isToday && isSolved) {
            return (
              <div key={key} className="flex min-w-[4.75rem] flex-[1.4] flex-col items-center">
                <span className="mb-2 text-[10px] font-bold text-zinc-400">{label}</span>
                <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-blue-600 px-2 py-1.5 text-[8px] font-black uppercase leading-none tracking-wide text-white shadow-[0_0_18px_rgba(37,99,235,0.65)] sm:px-2.5 sm:text-[10px]">
                  Today · Solved
                </span>
              </div>
            );
          }

          return (
            <div key={key} className="flex min-w-0 flex-1 flex-col items-center">
              <span className="mb-2 text-[10px] font-bold text-zinc-400">{label}</span>
              {isSolved ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
                  ✓
                </span>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-sm font-bold text-zinc-300">
                  ○
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
        🔥 {shownStreak}-Day Active Streak
      </div>
    </div>
  );
}

function DuelLinkModal({
  open,
  link,
  onClose,
  onCopy,
  onShare,
}: {
  open: boolean;
  link: string;
  onClose: () => void;
  onCopy: () => void;
  onShare: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="duel-link-title"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="duel-link-title" className="text-lg font-black uppercase tracking-tight text-zinc-900">
          ⚔️ Duel a Scout
        </h3>
        <p className="mt-2 text-sm text-zinc-500">Send your personal duel link. They play today&apos;s drop against your score.</p>
        <p className="mt-4 break-all rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-left font-mono text-xs text-zinc-800">
          {link}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCopy}
            className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700"
          >
            Copy link
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-800 hover:border-zinc-300"
          >
            Share
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function DailyDropWaitHub({
  streak,
  solvedDates,
  duelLink,
  onCopyLink,
  onShareLink,
}: {
  streak: number;
  solvedDates: string[];
  duelLink: string;
  onCopyLink: () => void;
  onShareLink: () => void;
}) {
  const [duelOpen, setDuelOpen] = useState(false);

  return (
    <section className="mt-4 space-y-4" aria-label="Next daily drop">
      <MidnightCountdown />
      <WeekStreakGrid solvedDates={solvedDates} streak={streak} />
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">While You Wait</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setDuelOpen(true)}
            className="rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-blue-700"
          >
            ⚔️ Duel a Scout
          </button>
          <Link
            href="/disciplines"
            className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-left hover:border-zinc-300"
          >
            <span className="block text-sm font-bold uppercase tracking-wider text-zinc-900">📚 Explore Sports Archive</span>
            <span className="mt-1 block text-[11px] font-medium normal-case tracking-normal text-zinc-500">
              Play past iconic Olympic, World Cup, and Hockey showdowns
            </span>
          </Link>
        </div>
      </div>
      <DuelLinkModal
        open={duelOpen}
        link={duelLink}
        onClose={() => setDuelOpen(false)}
        onCopy={onCopyLink}
        onShare={onShareLink}
      />
    </section>
  );
}
