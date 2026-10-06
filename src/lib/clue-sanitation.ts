const PLATE_PREFIX = /^(plate|figure)\s/i;

const FILLER_CLUES = [
  "Ledtråd 1: En klassisk mästerskapsmatch från den moderna eran.",
  "Ledtråd 2: Hög insats, en full läktare och ett skifte i matchbilden.",
  "Ledtråd 3: Scenen är berömd, och sportens egen kalender markerar dagen.",
  "Ledtråd 4: Den ena bär favoritens börda. Den andra kommer för att välta den.",
  "Ledtråd 5: En enda avgörande aktion spelas om när sporten berättar den här historien.",
  "Ledtråd 6: Eftermiddagen tar slut, och resultatet står kvar som en klassiker.",
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
  const named = name && yearLabel ? `${name} (${yearLabel})` : name || (yearLabel ? `Matchen ${yearLabel}` : "");
  const third = named
    ? `Ledtråd 3: ${named} minns man lika mycket för scenen som för siffrorna.`
    : FILLER_CLUES[2];
  return [FILLER_CLUES[0], FILLER_CLUES[1], third, FILLER_CLUES[3], FILLER_CLUES[4], FILLER_CLUES[5]];
}
