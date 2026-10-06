import { arrangeClueLadder } from "@/lib/clue-ladder";
import { sanitizeClues } from "@/lib/clue-sanitation";
import { publishedSwedishClues } from "@/lib/sport-kluringar-pool";

export function presentClues(
  id: string,
  clues: readonly string[],
  context?: { title?: string | null; year?: number | null; category?: string | null },
): string[] {
  const authored = publishedSwedishClues(id);
  if (authored) return [...authored];
  return arrangeClueLadder(sanitizeClues(clues, context), { category: context?.category });
}
