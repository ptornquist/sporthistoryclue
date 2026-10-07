import { arrangeClueLadder } from "@/lib/clue-ladder";
import { sanitizeClues } from "@/lib/clue-sanitation";
import { publishedEnglishClues } from "@/lib/i18n/english-clues";
import type { Locale } from "@/lib/i18n/types";
import { clueTexts } from "@/lib/sport-kluring";
import { publishedSwedishClues, sportKluringById } from "@/lib/sport-kluringar-pool";

export function presentClues(
  id: string,
  clues: readonly string[],
  context?: { title?: string | null; year?: number | null; category?: string | null },
  locale: Locale = "sv",
): string[] {
  const kluring = sportKluringById(id);
  if (kluring) return clueTexts(kluring, locale);
  if (locale === "en") {
    const english = publishedEnglishClues(id);
    if (english) return [...english];
  }
  const authored = publishedSwedishClues(id);
  if (authored) return [...authored];
  return arrangeClueLadder(sanitizeClues(clues, context), { category: context?.category });
}
