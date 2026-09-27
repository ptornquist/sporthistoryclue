"use client";

import type { TacticalTile } from "@/lib/tactical-board";
import { FREE_TILE_ID, formatTileCost } from "@/lib/tactical-board";
import { cn } from "@/lib/utils";

const PROMPT =
  "Review the opening briefing below. Unlock additional tactical intel tiles to deduce the fixture if needed.";

const TACTILE =
  "border-[2.5px] shadow-[3px_3px_0px_0px_rgba(24,24,27,0.85)] hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] active:translate-y-[2px] transition-all rounded-2xl p-4";

const SELECTED =
  "ring-4 ring-zinc-900/30 -translate-y-1 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] hover:shadow-[5px_5px_0px_0px_rgba(24,24,27,1)]";

const TILE_THEME: Record<TacticalTile["id"], { card: string; pill: string }> = {
  arena: {
    card: "bg-emerald-50/90 border-emerald-600 text-emerald-950",
    pill: "bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wider uppercase",
  },
  epoch: {
    card: "bg-amber-50/90 border-amber-600 text-amber-950",
    pill: "bg-amber-500 text-zinc-950 font-black text-xs px-2.5 py-1 rounded-md tracking-wider uppercase",
  },
  profiles: {
    card: "bg-sky-50/90 border-sky-600 text-sky-950",
    pill: "bg-sky-600 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wider uppercase",
  },
  archive: {
    card: "bg-purple-50/90 border-purple-600 text-purple-950",
    pill: "bg-purple-600 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wider uppercase",
  },
  decisive: {
    card: "bg-rose-50/90 border-rose-600 text-rose-950",
    pill: "bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wider uppercase",
  },
};

export function TacticalClueBoard({
  tiles,
  unlocked,
  activeId,
  imageUrl,
  locked,
  onSelect,
}: {
  tiles: readonly TacticalTile[];
  unlocked: readonly string[];
  activeId: string;
  imageUrl: string | null;
  locked: boolean;
  onSelect: (index: number) => void;
}) {
  const active = tiles.find((tile) => tile.id === activeId) ?? tiles[0];
  const openTiles = tiles.filter((tile) => unlocked.includes(tile.id));

  return (
    <div>
      <p className="mb-3 text-xs font-medium leading-relaxed text-zinc-500">{PROMPT}</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {tiles.map((tile, index) => {
          const revealed = unlocked.includes(tile.id);
          const selected = tile.id === active?.id;
          const theme = TILE_THEME[tile.id];
          const pill =
            tile.id === FREE_TILE_ID
              ? "FREE / UNLOCKED"
              : revealed
                ? "UNLOCKED"
                : `REVEAL ${formatTileCost(tile.cost)}`;
          return (
            <button
              key={tile.id}
              type="button"
              disabled={locked && !revealed}
              onClick={() => onSelect(index)}
              className={cn(
                "flex min-h-[88px] cursor-pointer flex-col items-start justify-between text-left disabled:cursor-default sm:min-h-[104px]",
                TACTILE,
                theme.card,
                selected && SELECTED,
              )}
            >
              <span className="text-lg sm:text-xl" aria-hidden>
                {tile.icon}
              </span>
              <span className="mt-2 text-[11px] font-black uppercase leading-tight tracking-wide sm:text-xs">
                {tile.name}
              </span>
              <span className={cn("mt-2", theme.pill)}>{pill}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <>
          {openTiles.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-1">
              {openTiles.map((tile) => {
                const index = tiles.findIndex((item) => item.id === tile.id);
                const selected = tile.id === active.id;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => onSelect(index)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      selected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {tile.icon} {tile.name}
                  </button>
                );
              })}
            </div>
          )}
          <div className="border-[3px] border-zinc-900 bg-white rounded-3xl p-6 md:p-8 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] relative overflow-hidden mt-6 mb-8">
            <h2 className="bg-zinc-900 text-white font-black px-3 py-1 rounded-lg text-xs uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
              ACTIVE INTEL: {active.icon} {active.name}
            </h2>
            {active.image && imageUrl ? (
              <div className="mb-4 border-2 border-zinc-900 rounded-xl overflow-hidden">
                <img src={imageUrl} alt="Archive photograph" className="h-auto w-full" />
              </div>
            ) : null}
            <p className="text-zinc-900 text-lg md:text-xl font-semibold leading-relaxed tracking-tight whitespace-pre-line">
              {active.text || "Nothing further is filed on this tile."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
