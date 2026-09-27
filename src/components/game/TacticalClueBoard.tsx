"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { playPhotoReveal, playTileUnlock, triggerHaptic } from "@/lib/audio";
import type { TacticalTile } from "@/lib/tactical-board";
import { FREE_TILE_ID, formatTileCost } from "@/lib/tactical-board";
import { cn } from "@/lib/utils";

const PROMPT =
  "Review the opening briefing below. Unlock additional tactical intel tiles to deduce the fixture if needed.";

const TACTILE =
  "border-[2.5px] shadow-[3px_3px_0px_0px_rgba(24,24,27,0.85)] hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] active:translate-y-[2px] transition-all rounded-2xl p-2.5 sm:p-4";

const SELECTED =
  "ring-4 ring-zinc-900/30 -translate-y-1 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] hover:shadow-[5px_5px_0px_0px_rgba(24,24,27,1)]";

const ARCHIVE_BLUR = "blur-xl scale-105 filter grayscale contrast-125";
const ARCHIVE_CLEAR = "blur-none scale-100 filter-none";

const TILE_THEME: Record<TacticalTile["id"], { card: string; pill: string }> = {
  arena: {
    card: "bg-emerald-50/90 border-emerald-600 text-emerald-950",
    pill: "bg-emerald-600 text-white font-black rounded-md tracking-wider uppercase",
  },
  epoch: {
    card: "bg-amber-50/90 border-amber-600 text-amber-950",
    pill: "bg-amber-500 text-zinc-950 font-black rounded-md tracking-wider uppercase",
  },
  profiles: {
    card: "bg-sky-50/90 border-sky-600 text-sky-950",
    pill: "bg-sky-600 text-white font-black rounded-md tracking-wider uppercase",
  },
  archive: {
    card: "bg-purple-50/90 border-purple-600 text-purple-950",
    pill: "bg-purple-600 text-white font-black rounded-md tracking-wider uppercase",
  },
  decisive: {
    card: "bg-rose-50/90 border-rose-600 text-rose-950",
    pill: "bg-rose-600 text-white font-black rounded-md tracking-wider uppercase",
  },
};

function ArchiveEvidence({ src }: { src: string }) {
  const [clear, setClear] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setClear(true), 40);
    return () => window.clearTimeout(timer);
  }, [src]);

  return (
    <div className="relative mb-3">
      <span className="absolute left-3 top-3 z-10 bg-zinc-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider border border-white/10">
        📷 ARCHIVE EVIDENCE
      </span>
      <img
        src={src}
        alt="Archive photograph"
        className={cn(
          "w-full max-h-56 sm:max-h-72 object-cover rounded-xl border-2 border-zinc-900 shadow-inner transition-all duration-700 ease-out",
          clear ? ARCHIVE_CLEAR : ARCHIVE_BLUR,
        )}
      />
    </div>
  );
}

export function TacticalClueBoard({
  tiles,
  unlocked,
  activeId,
  imageUrl,
  imageMissing = false,
  locked,
  onSelect,
}: {
  tiles: readonly TacticalTile[];
  unlocked: readonly string[];
  activeId: string;
  imageUrl: string | null;
  imageMissing?: boolean;
  locked: boolean;
  onSelect: (index: number) => void;
}) {
  const active = tiles.find((tile) => tile.id === activeId) ?? tiles[0];
  const openTiles = tiles.filter((tile) => unlocked.includes(tile.id));
  const showPhoto = Boolean(active?.image && imageUrl);
  const showFallback = Boolean(active?.image && !imageUrl && imageMissing);

  return (
    <div>
      <p className="mb-2 line-clamp-2 text-[11px] font-medium leading-snug text-zinc-500 sm:mb-3 sm:text-xs sm:leading-relaxed">{PROMPT}</p>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:gap-2.5 sm:overflow-visible sm:pb-0">
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
              onClick={() => {
                if (!revealed) {
                  playTileUnlock();
                  triggerHaptic("light");
                  if (tile.id === "archive") {
                    playPhotoReveal();
                    triggerHaptic("medium");
                  }
                }
                onSelect(index);
              }}
              className={cn(
                "flex w-[46%] shrink-0 snap-start min-h-[4.25rem] cursor-pointer flex-col items-start justify-between text-left disabled:cursor-default sm:w-auto sm:min-h-[6.5rem] sm:shrink",
                TACTILE,
                theme.card,
                selected && SELECTED,
              )}
            >
              <span className="text-base sm:text-xl" aria-hidden>
                {tile.icon}
              </span>
              <span className="mt-1 text-xs font-black uppercase leading-tight tracking-wide sm:mt-2">
                {tile.name}
              </span>
              <span className={cn("mt-1 px-2 py-0.5 text-[10px] sm:mt-2", theme.pill)}>{pill}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <>
          {openTiles.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-1 sm:mt-4">
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
          <div className="border-[3px] border-zinc-900 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] relative overflow-hidden mt-4 mb-4">
            <h2 className="bg-zinc-900 text-white font-black px-3 py-1 rounded-lg text-xs uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
              ACTIVE INTEL: {active.icon} {active.name}
            </h2>
            {showPhoto && imageUrl ? <ArchiveEvidence key={imageUrl} src={imageUrl} /> : null}
            {showFallback ? (
              <div className="mb-3 flex flex-col items-center rounded-xl border-2 border-zinc-900 bg-zinc-50 px-4 py-6 text-center shadow-inner">
                <Camera className="h-8 w-8 text-zinc-900" aria-hidden />
                <p className="mt-2 text-sm font-semibold leading-snug text-zinc-900">
                  {active.text || "Nothing further is filed on this tile."}
                </p>
              </div>
            ) : (
              <p className="text-zinc-900 text-sm sm:text-base md:text-lg font-semibold leading-snug sm:leading-relaxed tracking-tight whitespace-pre-line">
                {active.text || "Nothing further is filed on this tile."}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
