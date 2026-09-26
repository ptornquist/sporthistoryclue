"use client";

import Link from "next/link";
import { fixtureSubtitle } from "@/lib/case-files";

interface FixturePreviewProps {
  title: string;
  year: number;
  context: string;
  solvedScore: number | null;
  matchup: string | null;
  href: string;
  density?: "compact" | "row";
  onChallenge?: () => void;
}

export function FixturePreview({
  title,
  year,
  context,
  solvedScore,
  matchup,
  href,
  density = "compact",
  onChallenge,
}: FixturePreviewProps) {
  const solved = solvedScore != null;
  const reveal = solved ? matchup : null;
  const subtitle = fixtureSubtitle(year, context);

  const body = (
    <div className="min-w-0 text-left">
      <span
        className={`font-bold text-zinc-900 group-hover:text-blue-600 block ${
          density === "row" ? "text-sm font-black truncate" : "text-xs"
        }`}
      >
        {title}
      </span>
      <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{subtitle}</span>
      {solved ? (
        <span className="mt-1.5 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          ✓ SOLVED · {solvedScore} PTS
        </span>
      ) : null}
      {reveal ? (
        <span className="mt-1 block text-[11px] font-semibold text-zinc-700">{reveal}</span>
      ) : null}
    </div>
  );

  const action = solved ? null : (
    <span className="inline-flex min-h-[48px] shrink-0 items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider active:scale-[0.98] touch-manipulation">
      PLAY →
    </span>
  );

  const challengeButton = onChallenge ? (
    <button
      type="button"
      title="Challenge a friend to this fixture"
      onClick={onChallenge}
      className="inline-flex min-h-[48px] shrink-0 items-center border border-zinc-200 hover:border-blue-400 text-zinc-700 hover:text-blue-600 px-3 py-2 rounded-xl text-xs font-bold active:scale-[0.98] touch-manipulation"
    >
      ⚔️ Challenge
    </button>
  ) : null;

  if (!onChallenge) {
    return (
      <Link
        href={href}
        className={
          density === "row"
            ? "group flex touch-manipulation items-center justify-between gap-4 rounded-2xl border border-zinc-200/60 bg-zinc-50 p-4 transition-all hover:bg-zinc-100/80 active:scale-[0.98]"
            : "group flex w-full touch-manipulation items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50 active:scale-[0.98]"
        }
      >
        {body}
        {action}
      </Link>
    );
  }

  return (
    <div
      className={
        density === "row"
          ? "flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/60 bg-zinc-50 p-4"
          : "flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3"
      }
    >
      <Link href={href} className="group flex min-w-0 flex-1 touch-manipulation items-center justify-between gap-4 text-left active:scale-[0.98]">
        {body}
        {action}
      </Link>
      {challengeButton}
    </div>
  );
}
