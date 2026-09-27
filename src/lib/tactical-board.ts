export const STARTING_SCORE = 10_000;

export interface TacticalTile {
  id: "arena" | "epoch" | "profiles" | "archive" | "decisive";
  icon: string;
  name: string;
  cost: number;
  text: string;
  image: boolean;
}

const TACTICAL_TILES: readonly Omit<TacticalTile, "text">[] = [
  { id: "arena", icon: "🏟️", name: "The Arena & Stakes", cost: 1000, image: false },
  { id: "epoch", icon: "⏱️", name: "Era & Context", cost: 1500, image: false },
  { id: "profiles", icon: "📋", name: "Lineup & Tactics", cost: 2000, image: false },
  { id: "archive", icon: "📸", name: "Archive Photo", cost: 2500, image: true },
  { id: "decisive", icon: "⚡", name: "The Climax", cost: 3500, image: false },
];

export const FREE_TILE_ID = "arena";

export function formatPoints(value: number): string {
  return Math.max(0, Math.round(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatTileCost(cost: number): string {
  const formatted = Math.max(0, Math.round(cost)).toLocaleString("en-US");
  return `-${formatted} PTS`;
}

export function applyTileCost(score: number, cost: number): number {
  return Math.max(0, score - cost);
}

export function safeImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Older dossiers store a plain `clues` array. The first five strings fill the
 * tactical tiles in order. A sixth string stays on The Climax.
 */
export function buildTacticalBoard(clues: readonly string[]): TacticalTile[] {
  const lines = clues.map((clue) => clue.trim()).filter((clue) => clue.length > 0);
  return TACTICAL_TILES.map((tile, index) => {
    const text =
      index < TACTICAL_TILES.length - 1
        ? lines[index] ?? ""
        : lines.slice(index).join("\n\n");
    return { ...tile, text };
  });
}
