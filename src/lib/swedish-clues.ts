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

function isEnglishProse(text: string): boolean {
  if (/[åäöÅÄÖ]/.test(text)) return false;
  if (/\b(och|en|ett|som|från|mot|den|det|inte|redan|utan)\b/i.test(text)) return false;
  return /\b(the|and|with|winner|amateurs|against|scoreboard|field house|defeats|versus)\b/i.test(text);
}

/** Phrase fixes for stored English names. A fully English sentence is dropped, not replaced by one shared line. */
export function localizeDailyClue(clue: string): string {
  const original = clue.trim();
  if (!original) return "";
  let text = original;
  for (const [pattern, replacement] of REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  text = text.replace(/\s+/g, " ").trim();
  if (isEnglishProse(text)) return "";
  return text;
}
