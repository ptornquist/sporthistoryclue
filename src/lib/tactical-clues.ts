export const CLUE_FALLBACK = "Nothing further is filed on this tile.";

type ClueChallenge = { tactical_clues?: unknown; clues?: unknown } | null | undefined;

function clueString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const row = value as Record<string, unknown>;
  return (
    clueString(row.text) ||
    clueString(row.body) ||
    clueString(row.clue) ||
    clueString(row.content) ||
    clueString(row.label) ||
    clueString(row.quote)
  );
}

/**
 * Reads one tactical tile from the shapes stored on a challenge:
 * a string array, an array of `{ text }` rows, a JSON string, or a keyed object.
 */
export function getClueContent(challenge: ClueChallenge, tileIndex: number, tileId?: string): string {
  if (!challenge) return CLUE_FALLBACK;

  let clues: unknown = challenge.tactical_clues ?? challenge.clues;
  if (typeof clues === "string") {
    const raw = clues.trim();
    try {
      clues = JSON.parse(raw);
    } catch {
      return tileIndex === 0 && raw ? raw : CLUE_FALLBACK;
    }
  }
  if (!clues) clues = {};

  if (Array.isArray(clues)) {
    const item = clues[tileIndex] as unknown;
    const fromText = item && typeof item === "object" ? clueString((item as { text?: unknown }).text) : "";
    return fromText || clueString(item) || CLUE_FALLBACK;
  }

  const bag = clues as Record<string, unknown>;
  const pick = (...keys: Array<string | number | undefined>) => {
    for (const key of keys) {
      if (key == null || key === "") continue;
      const line = clueString(bag[key]);
      if (line) return line;
    }
    return "";
  };

  switch (tileIndex) {
    case 0:
      return pick("arena", "the_arena", "arena_stakes", "stadium", 0, tileId) || CLUE_FALLBACK;
    case 1:
      return pick("era", "era_context", "context", 1, tileId) || CLUE_FALLBACK;
    case 2:
      return pick("lineup", "lineup_tactics", "tactics", 2, tileId) || CLUE_FALLBACK;
    case 3:
      return pick("image_clue", "archive_photo", "photo", 3, tileId) || CLUE_FALLBACK;
    case 4:
      return pick("climax", "the_climax", 4, tileId) || CLUE_FALLBACK;
    default:
      return CLUE_FALLBACK;
  }
}

/** Ordered clue lines for the dossier. Keyed objects stay in tile order. */
export function resolveTacticalClueList(source: unknown): string[] {
  if (typeof source === "string") {
    const trimmed = source.trim();
    if (!trimmed) return [];
    try {
      return resolveTacticalClueList(JSON.parse(trimmed) as unknown);
    } catch {
      return [trimmed];
    }
  }
  if (Array.isArray(source)) {
    return source.map((item) => clueString(item)).filter(Boolean);
  }
  if (source && typeof source === "object") {
    return [0, 1, 2, 3, 4]
      .map((index) => getClueContent({ tactical_clues: source }, index))
      .filter((line) => line !== CLUE_FALLBACK);
  }
  return [];
}
