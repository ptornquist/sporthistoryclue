"use client";

import Link from "next/link";
import { fixtureSubtitle } from "@/lib/case-files";

interface FixturePreviewProps {
  title: string;
  year: number;
  context: string;
  solvedScore: number | null;
  matchup: string | null;
  onDeduce?: () => void;
  href?: string;
  onChallenge?: () => void;
  density?: "compact" | "row";
}

export function FixturePreview({
  title,
  year,
  context,
  solvedScore,
  matchup,
  onDeduce,
  href,
  onChallenge,
  density = "compact",
}: FixturePreviewProps) {
  const solved = solvedScore != null;
  const reveal = solved ? matchup : null;
  const subtitle = fixtureSubtitle(year, context);

  const body = (
    <div className="min-w-0 text-left">
      <span
        className={`block max-w-full break-words font-bold text-zinc-900 group-hover:text-blue-600 ${
          density === "row" ? "text-sm font-black" : "text-xs"
        }`}
      >
        {title}
      </span>
      <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{subtitle}</span>
      {solved ? (
        <span className="mt-1.5 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          ✓ AVKLARAD · {solvedScore} POÄNG
        </span>
      ) : null}
      {reveal ? (
        <span className="mt-1 block text-[11px] font-semibold text-zinc-700">{reveal}</span>
      ) : null}
    </div>
  );

  if (density === "row") {
    return (
      <div
        className="flex w-full max-w-full flex-col gap-2 rounded-2xl border border-zinc-200/60 bg-zinc-50 p-4 transition-all group hover:bg-zinc-100/80 sm:flex-row sm:items-center sm:justify-between"
        onClick={solved && onDeduce ? onDeduce : undefined}
        onKeyDown={
          solved
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onDeduce?.();
                }
              }
            : undefined
        }
        role={solved ? "button" : undefined}
        tabIndex={solved ? 0 : undefined}
      >
        {body}
        {solved ? null : href ? (
          <Link
            href={href}
            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-700"
          >
            DEDUCERA →
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onDeduce?.()}
            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-700"
          >
            DEDUCERA →
          </button>
        )}
        {onChallenge ? (
          <button
            type="button"
            onClick={onChallenge}
            className="shrink-0 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wider text-zinc-800"
          >
            Utmana
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onDeduce}
      className="group flex w-full max-w-full flex-col justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50 sm:flex-row sm:items-center"
    >
      {body}
      {solved ? null : (
        <span className="shrink-0 text-xs font-bold text-blue-600">DEDUCERA →</span>
      )}
    </button>
  );
}
