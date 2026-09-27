"use client";

import type { TacticalTile } from "@/lib/tactical-board";
import { formatTileCost } from "@/lib/tactical-board";

export function TacticalClueBoard({
  tiles,
  opened,
  imageUrl,
  locked,
  onReveal,
}: {
  tiles: readonly TacticalTile[];
  opened: readonly number[];
  imageUrl: string | null;
  locked: boolean;
  onReveal: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
      {tiles.map((tile, index) => {
        const revealed = opened.includes(index);
        if (!revealed) {
          return (
            <button
              key={tile.id}
              type="button"
              disabled={locked}
              onClick={() => onReveal(index)}
              className="flex min-h-[88px] flex-col items-start justify-between rounded-2xl border border-zinc-200 bg-white p-3 text-left hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all disabled:cursor-default disabled:hover:border-zinc-200 disabled:hover:shadow-none sm:min-h-[104px] sm:p-4"
            >
              <span className="text-lg sm:text-xl" aria-hidden>
                {tile.icon}
              </span>
              <span className="mt-2 text-[11px] font-black uppercase leading-tight tracking-wide text-zinc-900 sm:text-xs">
                {tile.name}
              </span>
              <span className="mt-2 rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-600">
                {formatTileCost(tile.cost)}
              </span>
            </button>
          );
        }

        return (
          <article
            key={tile.id}
            className="flex min-h-[88px] flex-col rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-left sm:min-h-[104px] sm:p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-black uppercase leading-tight tracking-wide text-zinc-900 sm:text-xs">
                <span aria-hidden>{tile.icon} </span>
                {tile.name}
              </span>
              <span className="text-sm font-black text-emerald-700" aria-label="Unlocked">
                ✓
              </span>
            </div>
            {tile.image && imageUrl ? (
              <div className="relative mt-2 h-28 overflow-hidden rounded-xl sm:h-36">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${imageUrl}")` }}
                  role="img"
                  aria-label="Archive photograph"
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
              </div>
            ) : (
              <p className="mt-2 text-xs font-medium leading-snug text-zinc-800 sm:text-sm">
                {tile.text || "Nothing further is filed on this tile."}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
