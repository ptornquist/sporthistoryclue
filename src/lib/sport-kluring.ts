export interface SportKluring {
  id: string;
  sport: "ice_hockey" | "football" | "boxing" | "tennis" | "athletics" | "equestrian" | "handball";
  title: { sv: string; en: string };
  category: { sv: string; en: string };
  year: number;
  cards: {
    step: number;
    title: { sv: string; en: string };
    text: { sv: string; en: string };
  }[];
  options: { sv: string[]; en: string[] };
  correctAnswerIndex: number;
}

export const KLURING_CARD_TITLES: SportKluring["cards"][number]["title"][] = [
  { sv: "Arena", en: "Arena" },
  { sv: "Epok", en: "Era" },
  { sv: "Taktik", en: "Tactics" },
  { sv: "Avgörande", en: "Turning point" },
  { sv: "Klimax", en: "Climax" },
];

export function clueTexts(kluring: SportKluring, locale: "sv" | "en"): string[] {
  return kluring.cards.map((card) => card.text[locale]);
}

export function optionLabels(kluring: SportKluring, locale: "sv" | "en"): string[] {
  return [...kluring.options[locale]];
}

export function correctOption(kluring: SportKluring, locale: "sv" | "en"): string {
  return kluring.options[locale][kluring.correctAnswerIndex] ?? "";
}

export function guessMatchesKluring(kluring: SportKluring, option: string): boolean {
  const guess = option.trim().toLowerCase();
  if (!guess) return false;
  const swedish = correctOption(kluring, "sv").trim().toLowerCase();
  const english = correctOption(kluring, "en").trim().toLowerCase();
  return guess === swedish || guess === english;
}
