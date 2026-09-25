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
}

export function FixturePreview({
  title,
  year,
  context,
  solvedScore,
  matchup,
  href,
  density = "compact",
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

  const action = solved ? null : density === "row" ? (
    <span className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm">
      DEDUCE →
    </span>
  ) : (
    <span className="shrink-0 text-xs font-bold text-blue-600">DEDUCE →</span>
  );

  return (
    <Link
      href={href}
      className={
        density === "row"
          ? "group flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/60 bg-zinc-50 p-4 transition-all hover:bg-zinc-100/80"
          : "group flex w-full items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"
      }
    >
      {body}
      {action}
    </Link>
  );
}
