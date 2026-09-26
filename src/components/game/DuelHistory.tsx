"use client";

import { useEffect, useState } from "react";
import {
  formatAgo,
  mergeDuels,
  outcomeFor,
  pickRematchSlug,
  readDuelInbox,
  rematchLink,
  sidesFor,
  type DuelOutcome,
  type DuelRecord,
} from "@/lib/duels";

const OUTCOME_CLASS: Record<DuelOutcome, string> = {
  victory: "bg-emerald-100 text-emerald-800",
  defeat: "bg-rose-100 text-rose-800",
  draw: "bg-zinc-100 text-zinc-600",
};

const OUTCOME_LABEL: Record<DuelOutcome, string> = {
  victory: "Victory",
  defeat: "Defeat",
  draw: "Draw",
};

function ClashTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLabel(formatAgo(iso, new Date())), 0);
    return () => window.clearTimeout(timer);
  }, [iso]);

  return (
    <time dateTime={iso} className="block min-h-4 text-[11px] font-medium text-zinc-400">
      {label ?? "\u00a0"}
    </time>
  );
}

export function DuelHistory({
  username,
  playedIds,
  ready,
  onToast,
}: {
  username: string;
  playedIds: string[];
  ready: boolean;
  onToast: (message: string) => void;
}) {
  const [duels, setDuels] = useState<DuelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !username) return;
    let cancelled = false;
    const load = async () => {
      let remote: DuelRecord[] = [];
      try {
        const response = await fetch(`/api/duels?username=${encodeURIComponent(username)}`);
        if (response.ok) {
          const payload = (await response.json()) as { duels?: DuelRecord[] };
          remote = payload.duels ?? [];
        }
      } catch {
        remote = [];
      }
      if (!cancelled) {
        setDuels(mergeDuels(remote, readDuelInbox().filter(involves(username))));
        setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [ready, username]);

  const copyRematch = async (score: number) => {
    const slug = pickRematchSlug(playedIds);
    const link = rematchLink(username, score, slug);
    try {
      await navigator.clipboard.writeText(link);
      onToast("⚔️ Rematch link copied!");
    } catch {
      onToast("Could not copy the rematch link.");
    }
  };

  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm" aria-busy={loading}>
      <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900">Head-to-Head Match History</h2>
      <p className="mt-1 text-xs font-medium text-zinc-500">Duel arena results for @{username}.</p>
      <div className="mt-6 min-h-[288px] space-y-3">
        {loading ? (
          [0, 1, 2].map((slot) => (
            <div key={slot} className="h-24 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-100" />
          ))
        ) : duels.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-xs font-medium text-zinc-400">
            No duels yet. Challenge a scout from today&apos;s drop.
          </div>
        ) : (
          duels.map((duel) => {
            const outcome = outcomeFor(username, duel);
            const sides = sidesFor(username, duel);
            return (
              <article key={duel.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${OUTCOME_CLASS[outcome]}`}>
                      {OUTCOME_LABEL[outcome]}
                    </span>
                    <p className="mt-2 text-sm font-black text-zinc-900">
                      @You <span className="font-bold text-zinc-400">vs</span> @{sides.opponent}
                    </p>
                    <p className="mt-1 font-mono text-xs font-bold text-zinc-700">
                      {sides.you.toLocaleString()} PTS <span className="text-zinc-400">vs</span> {sides.them.toLocaleString()} PTS
                    </p>
                    <ClashTime iso={duel.created_at} />
                  </div>
                  <button
                    type="button"
                    onClick={() => { void copyRematch(sides.you); }}
                    className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white hover:bg-blue-700"
                  >
                    Rematch
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function involves(username: string) {
  const handle = username.toLowerCase();
  return (row: DuelRecord) =>
    row.challenger_username.toLowerCase() === handle || row.opponent_username.toLowerCase() === handle;
}
