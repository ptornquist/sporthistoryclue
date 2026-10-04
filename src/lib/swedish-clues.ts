import { hashString } from "@/lib/utils";

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/Olympic Field House i Lake Placid/gi, "olympiahallen i bergsbyn"],
  [/Olympic Field House, Lake Placid/gi, "olympiahallen i bergsbyn"],
  [/Olympic Field House/gi, "olympiahallen"],
  [/Lake Placid/gi, "bergsbyn"],
  [/Centre Court/gi, "huvudbanan"],
  [/från New York/gi, "från andra sidan Atlanten"],
  [/Houston Astrodome/gi, "inomhusarenan i Houston"],
  [/Lusail Stadium/gi, "Lusail"],
  [/London Stadium/gi, "Londons olympiastadion"],
  [/Rose Bowl/gi, "den skålformade arenan"],
  [/Premier League/gi, "den engelska högstaligan"],
];

const SWEDISH_FALLBACKS = [
  "En arena som redan är full innan startskottet.",
  "En epok då den här sporten samlade ett helt land.",
  "Uppställningen bär favoritens börda och skrällens chans.",
  "Ett beskuret arkivfoto, utan namn i bildtexten.",
  "Avgörandet sparas till det sista kortet.",
] as const;

function isEnglishProse(text: string): boolean {
  if (/[åäöÅÄÖ]/.test(text)) return false;
  if (/\b(och|en|ett|som|från|mot|den|det|inte|redan|utan)\b/i.test(text)) return false;
  return /\b(the|and|with|winner|amateurs|against|scoreboard|field house|defeats|versus)\b/i.test(text);
}

/** Swedish clue copy. Known English place names and leftover English sentences are rewritten. */
export function localizeDailyClue(clue: string): string {
  const original = clue.trim();
  if (!original) return "";
  let text = original;
  for (const [pattern, replacement] of REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  text = text.replace(/\s+/g, " ").trim();
  if (!isEnglishProse(text)) return text;
  return SWEDISH_FALLBACKS[hashString(original) % SWEDISH_FALLBACKS.length];
}
