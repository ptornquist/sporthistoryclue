"use client";

import { useEffect, useState } from "react";
import {
  CLUE_COUNT_KEYS,
  barWidth,
  baselineDistribution,
  sharePercent,
  type ClueDistribution,
} from "@/lib/clue-stats";

const ROWS: { clue: number; label: string; key: keyof ClueDistribution }[] = [
  { clue: 1, label: "Ledtråd 1", key: "clue_1" },
  { clue: 2, label: "Ledtråd 2", key: "clue_2" },
  { clue: 3, label: "Ledtråd 3", key: "clue_3" },
  { clue: 4, label: "Ledtråd 4", key: "clue_4" },
  { clue: 5, label: "Ledtråd 5", key: "clue_5" },
  { clue: 6, label: "Ledtråd 6", key: "clue_6" },
  { clue: 0, label: "Bom", key: "missed" },
];

export function CommunityClueDistribution({
  challengeId,
  userSolvedClue,
  refreshToken = 0,
}: {
  challengeId: string;
  userSolvedClue: number;
  refreshToken?: number;
}) {
  const [stats, setStats] = useState<ClueDistribution>(() => baselineDistribution(challengeId));

  useEffect(() => {
    let cancelled = false;
    const fallback = baselineDistribution(challengeId);
    fetch(`/api/stats?challengeId=${encodeURIComponent(challengeId)}`)
      .then(async (response) => {
        if (!response.ok) return fallback;
        return (await response.json()) as ClueDistribution;
      })
      .then((next) => {
        if (!cancelled && next) setStats(next);
      })
      .catch(() => {
        if (!cancelled) setStats(fallback);
      });
    return () => {
      cancelled = true;
    };
  }, [challengeId, refreshToken]);

  const counts = CLUE_COUNT_KEYS.map((key) => stats[key]).concat(stats.missed);
  const maxCount = Math.max(...counts, 1);

  return (
    <section className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 text-left" aria-label="Hur andra löste kluringen">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900">Hur andra löste den</h3>
        <span className="font-mono text-xs font-bold text-zinc-500">{stats.total_solves.toLocaleString("sv-SE")} scouter</span>
      </div>
      <div className="space-y-2">
        {ROWS.map((row) => {
          const count = stats[row.key];
          const width = barWidth(count, maxCount);
          const yours = userSolvedClue === row.clue;
          return (
            <div key={row.label} className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{row.label}</span>
              <div className="h-8">
                <div
                  className={`flex h-8 items-center justify-end gap-2 rounded-md px-2 ${
                    yours
                      ? "bg-blue-600 text-white font-black ring-2 ring-blue-500/30"
                      : "bg-zinc-200 text-zinc-700 font-bold"
                  }`}
                  style={{ width: `${width}%`, minWidth: "4.5rem" }}
                >
                  {yours && (
                    <span className="mr-auto rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-black tracking-wider">
                      YOU
                    </span>
                  )}
                  <span className="font-mono text-[11px]">{sharePercent(count, stats.total_solves)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
