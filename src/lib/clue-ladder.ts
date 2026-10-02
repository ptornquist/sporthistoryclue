const SCOREBOARD =
  /\b\d+\s*[–—-]\s*\d+\b|\bscore\b|\bwinner\b|\bopponent\b|\bscorer\b|\bperfect 10\b|\b\d+\.\d{2}\b/i;

const NUMERIC_SCORE =
  /\b\d+\s*[–—-]\s*\d+\b|\bperfect 10\b|\b\d+\.\d{2}\b|\b(?:ko|tko)\b|\bround\s+\d+\b/i;

const PADDED_CLUE = /^clue #\d+:/i;

const PERSON = /\b[A-Z][a-zà-ÿ]{2,}(?:\s+[A-Z][a-zà-ÿ]{2,})+\b/g;

const VENUE =
  /\b(venue|stadium|arena|rink|court|olympic|olympics|world cup|tournament|quarter-final|semi-final|medal|village|stage|setting|calendar)\b|\b(?:1[89]\d{2}|20\d{2})\b/i;

const PLACE_WORD =
  /^(lake|new|san|los|mexico|centre|center|world|olympic|estadio|old|wembley|azteca|barcelona|munich|berlin|athens|paris|london|rome|tokyo|beijing|sydney|seoul|montreal|moscow|kinshasa|wimbledon|roland|queens|flushing|panathenaic|centre|city|cup|games|series|final|court|stadium|arena|rink)$/i;

export function arrangeClueLadder(
  clues: readonly string[],
  hints?: { category?: string | null },
): string[] {
  const atmosphere: string[] = [];
  const venue: string[] = [];
  const decisive: string[] = [];

  for (const clue of clues) {
    const text = clue.trim();
    if (!text || PADDED_CLUE.test(text)) continue;
    const bucket = classifyClue(text);
    if (bucket === "decisive") decisive.push(text);
    else if (bucket === "venue") venue.push(text);
    else atmosphere.push(text);
  }

  const tournament = hints?.category?.trim().toLowerCase();
  const venueFill: [string, string] = [
    tournament
      ? `The stage belongs to the ${tournament}, and the sport's own calendar has circled this date.`
      : "The venue is a championship ground, and the tournament bracket is down to a deciding tie.",
    "The setting narrows the map: a famous arena for this sport, not a friendly exhibition.",
  ];
  const stakes = [
    "The building is already on its feet. The next minute will be argued about for years.",
    "One side carries the favorite's burden. The other only needs one swing of momentum.",
  ];
  const [nameClue, scoreClue] = pickDecisive(decisive);
  const [venueClue, tournamentClue] = twoDistinct(venue, venueFill);

  return [
    atmosphere[0] ?? stakes[0],
    atmosphere[1] ?? stakes[1],
    venueClue,
    tournamentClue,
    nameClue,
    scoreClue,
  ];
}

function twoDistinct(preferred: string[], fills: [string, string]): [string, string] {
  const first = preferred[0] ?? fills[0];
  const alternate = first === fills[0] ? fills[1] : fills[0];
  const second = preferred[1] && preferred[1] !== first ? preferred[1] : alternate;
  return [first, second === first ? alternate : second];
}

function pickDecisive(decisive: string[]): [string, string] {
  const fallbackName = "The decisive names stay with the final score, revealed only once the stage is clear.";
  const fallbackScore = "The final score is the line that closed the record.";
  const numeric = decisive.find((clue) => NUMERIC_SCORE.test(clue));
  const named = decisive.find((clue) => clue !== numeric && isNamedResult(clue));
  const first = named ?? decisive.find((clue) => clue !== numeric) ?? fallbackName;
  const second = numeric && numeric !== first ? numeric : decisive.find((clue) => clue !== first) ?? fallbackScore;
  if (second === first) return [first, first === fallbackScore ? fallbackName : fallbackScore];
  return [first, second];
}

function classifyClue(text: string): "atmosphere" | "venue" | "decisive" {
  if (SCOREBOARD.test(text) || isNamedResult(text)) return "decisive";
  if (VENUE.test(text)) return "venue";
  return "atmosphere";
}

function isNamedResult(text: string): boolean {
  return hasPersonName(text) || /\b(winner|opponent|scorer)\b/i.test(text) || /\bvs\.?\b/i.test(text);
}

function hasPersonName(text: string): boolean {
  const matches = text.match(PERSON) ?? [];
  return matches.some((name) => {
    const words = name.split(/\s+/);
    if (words.length === 0 || PLACE_WORD.test(words[0])) return false;
    return words.some((word) => !PLACE_WORD.test(word));
  });
}
