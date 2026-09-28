"use client";

import { useEffect, useState } from "react";
import { aggregateScoutStats, emptyStreak, readScoutDossier, type ScoutStats } from "@/lib/scout-dossier";

const STAT_BOX = "border-2 border-zinc-900 bg-white rounded-xl p-3 text-center shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]";

const RANK_BADGE =
  "border-2 border-zinc-900 bg-amber-100 text-amber-950 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider";

function blankStats(): ScoutStats {
  return aggregateScoutStats([], emptyStreak(), null);
}

export function StatsModal({
  open,
  onClose,
  stats,
}: {
  open: boolean;
  onClose: () => void;
  stats?: ScoutStats;
}) {
  const [loaded, setLoaded] = useState<ScoutStats | null>(stats ?? null);

  useEffect(() => {
    if (!open || stats) return;
    Promise.resolve().then(() => setLoaded(readScoutDossier()));
  }, [open, stats]);

  if (!open) return null;
  const view = stats ?? loaded ?? blankStats();
  const peak = Math.max(1, ...view.distribution.map((bucket) => bucket.count));

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Scout Dossier">
      <button type="button" className="absolute inset-0 bg-zinc-950/50" aria-label="Close dossier" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border-[3px] border-zinc-900 bg-[#fafafa] p-5 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">SCOUT DOSSIER</h2>
            <span className={`mt-2 inline-flex ${RANK_BADGE}`}>{view.rank}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-zinc-900 px-3 py-1 text-sm font-black"
            aria-label="Close scout dossier"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className={STAT_BOX}>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Played</p>
            <p className="mt-1 text-2xl font-black">{view.played}</p>
          </div>
          <div className={STAT_BOX}>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Win %</p>
            <p className="mt-1 text-2xl font-black">{view.winRate}</p>
          </div>
          <div className={STAT_BOX}>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Current Streak 🔥</p>
            <p className="mt-1 text-2xl font-black">{view.currentStreak}</p>
          </div>
          <div className={STAT_BOX}>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Max Streak ⚡</p>
            <p className="mt-1 text-2xl font-black">{view.maxStreak}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className={STAT_BOX}>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Intel Points</p>
            <p className="mt-1 text-xl font-black">{view.intelPoints.toLocaleString("en-US")}</p>
          </div>
          <div className={STAT_BOX}>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Avg Clues</p>
            <p className="mt-1 text-xl font-black">{view.averageClues.toFixed(1)} / 5</p>
          </div>
        </div>

        <section className="mt-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Intel Reveal Distribution</h3>
          <ul className="mt-2 space-y-2">
            {view.distribution.map((bucket) => (
              <li key={bucket.tile} className="flex items-center gap-2">
                <span className="w-16 text-xs font-black text-zinc-900">
                  {bucket.tile} {bucket.label}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full border border-zinc-900 bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${bucket.count === 0 ? 0 : Math.max(8, (bucket.count / peak) * 100)}%` }}
                  />
                </div>
                <span className="min-w-8 border-2 border-zinc-900 bg-amber-100 px-1.5 py-0.5 text-center text-xs font-black">
                  {bucket.count}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Sports Breakdown</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {view.sports.map((sport) => (
              <span key={sport.id} className="rounded-full border-2 border-zinc-900 bg-white px-2.5 py-1 text-xs font-black">
                {sport.icon} {sport.label} {sport.wins}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 border-2 border-zinc-900 bg-white rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Backed Club</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="font-black text-zinc-900">{view.club ? `${view.club.badge} ${view.club.name}` : "No club backed"}</p>
            <p className="font-black text-zinc-900">{view.clubPoints.toLocaleString("en-US")} PTS</p>
          </div>
        </section>
      </div>
    </div>
  );
}
