const PLATE_PREFIX = /^(plate|figure)\s/i;

const FILLER_CLUES = [
  "Clue #1: An iconic championship fixture held in the modern era.",
  "Clue #2: High stakes, extreme crowd tension, and a defining momentum shift.",
  "Clue #3: The setting is a famous stage, and the sport's own calendar marks the day.",
  "Clue #4: One competitor carries the favorite's burden. The other brings the upset.",
  "Clue #5: A single decisive action is still replayed when the sport tells this story.",
  "Clue #6: The afternoon ended, and the result stayed in the record as a defining fixture.",
] as const;

export function isRejectedClue(value: string): boolean {
  const text = value.trim();
  if (!text) return true;
  if (PLATE_PREFIX.test(text)) return true;
  if (text.includes("— crop")) return true;
  if (text.toLowerCase().includes("photograph by")) return true;
  return false;
}

export function sanitizeClues(
  clues: readonly string[],
  context?: { title?: string | null; year?: number | null },
): string[] {
  const clean = clues.map((clue) => clue.trim()).filter((clue) => !isRejectedClue(clue));
  const fillers = fillerClues(context?.title, context?.year);
  const padded = [...clean];
  for (const filler of fillers) {
    if (padded.length >= 6) break;
    if (!padded.includes(filler)) padded.push(filler);
  }
  return padded.slice(0, 6);
}

function fillerClues(title?: string | null, year?: number | null): string[] {
  const name = title?.trim() ?? "";
  const yearLabel = typeof year === "number" && year > 0 ? String(year) : "";
  const named = name && yearLabel ? `${name} (${yearLabel})` : name || (yearLabel ? `The ${yearLabel} fixture` : "");
  const third = named
    ? `Clue #3: ${named} is remembered for the stage as much as the scoreline.`
    : FILLER_CLUES[2];
  return [FILLER_CLUES[0], FILLER_CLUES[1], third, FILLER_CLUES[3], FILLER_CLUES[4], FILLER_CLUES[5]];
}
