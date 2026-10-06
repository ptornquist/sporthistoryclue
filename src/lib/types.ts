export const SPORTS = [
  "football",
  "olympics",
  "athletics",
  "tennis",
  "boxing",
  "ice-hockey",
  "basketball",
  "rugby",
  "motorsport",
  "cricket",
  "golf",
  "gymnastics",
] as const;

export type Sport = (typeof SPORTS)[number];

export const SPORT_LABEL: Record<Sport, string> = {
  football: "Fotboll",
  olympics: "Olympiska spel",
  athletics: "Friidrott",
  tennis: "Tennis",
  boxing: "Boxning",
  "ice-hockey": "Ishockey",
  basketball: "Basket",
  rugby: "Rugby",
  motorsport: "Motorsport",
  cricket: "Cricket",
  golf: "Golf",
  gymnastics: "Gymnastik",
};

export type PlateId =
  | "pitch-night"
  | "olympic-track"
  | "ice-rink"
  | "boxing-ring"
  | "lawn-tennis"
  | "hardwood"
  | "rugby-turf"
  | "velodrome";

export type ClueKind = "image" | "stats" | "text" | "quote";

export interface RedactedStat {
  label: string;
  value: string;
  /** 1-based clue index at which this cell is unmasked. */
  revealedAtClue: number;
}

export interface ImageFocus {
  plateId: PlateId;
  /** CSS scale, typically 1.4–3.2 for early clues. */
  scale: number;
  /** Focal point as percentages of the plate. */
  x: number;
  y: number;
}

export interface Clue {
  kind: ClueKind;
  kicker?: string;
  body?: string;
  quote?: string;
  attribution?: string;
  stats?: RedactedStat[];
  image?: ImageFocus;
}

export interface Puzzle {
  id: string;
  year: number;
  sport: Sport;
  era: string;
  title: string;
  summary: string;
  teaser: string;
  answers: string[];
  clues: Clue[];
  expedition?: string;
  difficulty: 1 | 2 | 3;
}

/** Hidden answer sheet used by the validation route. Never sent to the client. */
export interface AnswerSheet {
  target_year: number;
  target_subject: string;
  accepted_aliases: string[];
}

export interface PublicPuzzle {
  id: string;
  sport: Sport;
  era: string;
  teaser: string;
  clueCount: number;
  clues: Clue[];
}

export interface EventOption {
  id: string;
  label: string;
}

export interface Expedition {
  slug: string;
  title: string;
  period: string;
  blurb: string;
  puzzleIds: string[];
}

export function toPublicPuzzle(puzzle: Puzzle): PublicPuzzle {
  return {
    id: puzzle.id,
    sport: puzzle.sport,
    era: puzzle.era,
    teaser: puzzle.teaser,
    clueCount: puzzle.clues.length,
    clues: puzzle.clues,
  };
}
