"use client";

import { useEffect, useState } from "react";
import type { TacticalTile } from "@/lib/tactical-board";
import { getClueContent as readClueContent } from "@/lib/tactical-clues";
import { cn } from "@/lib/utils";

const STEP_ICONS = ["🏟️", "⏱️", "📋", "📷", "⚡"] as const;
const CLUE_TITLES = ["THE ARENA", "THE ERA", "THE LINEUP", "THE PHOTO", "THE CLIMAX"] as const;

export const UNLOCKED_STEP =
  "border-2 border-zinc-950 bg-white font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";

export const ACTIVE_STEP =
  "border-2 border-amber-600 bg-amber-100 text-amber-950 font-black shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]";

export const LOCKED_STEP = "border-2 border-zinc-300 bg-zinc-100 text-zinc-400 font-bold";

export const CLUE_CARD =
  "min-h-[220px] md:min-h-[260px] max-h-[380px] overflow-y-auto flex flex-col justify-center items-center text-center p-6 bg-white border-[3px] border-zinc-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";

export const CLUE_TEXT = "text-base md:text-lg font-bold text-zinc-900 leading-snug";

const ARCHIVE_BLUR = "blur-xl scale-105 filter grayscale contrast-125";
const ARCHIVE_CLEAR = "blur-none scale-100 filter-none";

export function unlockPrompt(cost: number): string {
  const amount = Math.max(0, Math.round(cost)).toLocaleString("en-US");
  return `Unlock (-${amount} pts)`;
}

function ArchiveEvidence({ src }: { src: string }) {
  const [clear, setClear] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setClear(true), 40);
    return () => window.clearTimeout(timer);
  }, [src]);

  return (
    <img
      src={src}
      alt="Archive photograph"
      className={cn(
        "max-h-full min-h-0 w-full flex-1 object-contain transition-all duration-700 ease-out",
        clear ? ARCHIVE_CLEAR : ARCHIVE_BLUR,
      )}
    />
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
  tacticalClues,
  initialCostPrompt = null,
}: {
  tiles: readonly TacticalTile[];
  unlocked: readonly string[];
  activeId: string;
  imageUrl: string | null;
  imageMissing?: boolean;
  locked: boolean;
  onSelect: (index: number) => void;
  tacticalClues?: unknown;
  initialCostPrompt?: number | null;
}) {
  const [costPrompt, setCostPrompt] = useState<number | null>(initialCostPrompt);
  const active = tiles.find((tile) => tile.id === activeId) ?? tiles[0];
  const activeTileIndex = Math.max(0, tiles.findIndex((tile) => tile.id === active?.id));
  const challenge = { tactical_clues: tacticalClues ?? tiles.map((tile) => tile.text) };
  const getClueContent = (tileIndex: number, tileId?: string) => readClueContent(challenge, tileIndex, tileId);
  const intel = getClueContent(activeTileIndex, active?.id);
  const showPhoto = Boolean(active?.image && imageUrl && !imageMissing);
  const title = CLUE_TITLES[activeTileIndex] ?? "THE ARENA";

  const choose = (index: number) => {
    const tile = tiles[index];
    if (!tile) return;
    const revealed = unlocked.includes(tile.id);
    if (revealed) {
      setCostPrompt(null);
      onSelect(index);
      return;
    }
    if (locked) return;
    if (costPrompt === index) {
      setCostPrompt(null);
      onSelect(index);
      return;
    }
    setCostPrompt(index);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("grid grid-cols-5 gap-1", costPrompt !== null && "mb-6")}>
        {tiles.map((tile, index) => {
          const revealed = unlocked.includes(tile.id);
          const selected = tile.id === active?.id;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => choose(index)}
              aria-current={selected ? "true" : undefined}
              aria-label={`Clue ${index + 1}`}
              className={cn(
                "relative flex items-center justify-center rounded-xl px-0.5 py-2 text-xs sm:text-sm",
                selected ? ACTIVE_STEP : revealed ? UNLOCKED_STEP : LOCKED_STEP,
              )}
            >
              <span>{`${index + 1} ${STEP_ICONS[index]}`}</span>
              {costPrompt === index && (
                <span className="absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-zinc-950 bg-amber-200 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-zinc-950">
                  {unlockPrompt(tile.cost)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <div className={CLUE_CARD}>
          <h2 className="mx-auto mb-3 inline-flex border-2 border-zinc-950 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-zinc-950">
            {`CLUE ${activeTileIndex + 1}: ${title}`}
          </h2>
          {showPhoto && imageUrl ? (
            <div className="mb-3 flex max-h-48 w-full items-center justify-center overflow-hidden">
              <ArchiveEvidence key={imageUrl} src={imageUrl} />
            </div>
          ) : null}
          <p className={cn(CLUE_TEXT, "text-center whitespace-pre-line")}>{intel}</p>
        </div>
      )}
    </div>
  );
}
