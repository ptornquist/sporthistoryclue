"use client";

import type { TacticalTile } from "@/lib/tactical-board";
import { FREE_TILE_ID, formatTileCost } from "@/lib/tactical-board";

const PROMPT =
  "Läs startledtråden nedan. Köp fler taktiska brickor för poängavdrag om du behöver mer information för att gissa matchen.";

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
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
        {tiles.map((tile, index) => {
          const revealed = unlocked.includes(tile.id);
          const selected = tile.id === active?.id;
          return (
            <button
              key={tile.id}
              type="button"
              disabled={locked && !revealed}
              onClick={() => onSelect(index)}
              className={`flex min-h-[88px] flex-col items-start justify-between rounded-2xl border p-3 text-left sm:min-h-[104px] sm:p-4 ${
                revealed
                  ? `border-emerald-200 bg-emerald-50/80 ${selected ? "ring-2 ring-blue-600" : "cursor-pointer hover:border-emerald-300"}`
                  : "border-zinc-200 bg-white hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all disabled:cursor-default disabled:hover:border-zinc-200 disabled:hover:shadow-none"
              }`}
            >
              <span className="text-lg sm:text-xl" aria-hidden>
                {tile.icon}
              </span>
              <span className="mt-2 text-[11px] font-black uppercase leading-tight tracking-wide text-zinc-900 sm:text-xs">
                {tile.name}
              </span>
              {revealed ? (
                <span className="mt-2 rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                  {tile.id === FREE_TILE_ID ? "UPPLÅST / GRATIS" : "✓"}
                </span>
              ) : (
                <span className="mt-2 rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-600">
                  {formatTileCost(tile.cost)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <section className="mt-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-xs font-black tracking-wide text-zinc-900">
                AKTIV LEDTRÅD: {active.icon} {active.name}
              </h2>
            {openTiles.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {openTiles.map((tile) => {
                  const index = tiles.findIndex((item) => item.id === tile.id);
                  const selected = tile.id === active.id;
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => onSelect(index)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        selected ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {tile.icon} {tile.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="text-base md:text-lg text-zinc-900 font-medium leading-relaxed bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            {active.image && imageUrl ? (
              <div className="relative mb-4 h-40 overflow-hidden rounded-xl sm:h-52">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${imageUrl}")` }}
                  role="img"
                  aria-label="Archive photograph"
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
              </div>
            ) : null}
            <p className="whitespace-pre-line">{active.text || "Nothing further is filed on this tile."}</p>
          </div>
        </section>
      )}
    </div>
  );
}
