import { publishDailyClues } from "@/lib/daily-clue-copy";
import {
  choiceSportKey,
  ensureFourDailyOptions,
  inferOptionSport,
  SPORT_CHOICES,
} from "@/lib/sport-options";

const CATEGORY_LABEL: Record<string, string> = {
  ice_hockey: "Ice Hockey",
  football: "Football",
  boxing: "Boxing",
  tennis: "Tennis",
  athletics: "Athletics",
};

export interface DailyPresentation {
  id: string;
  date_key: string;
  category: string;
  clues: readonly string[];
  options: readonly string[];
}

/**
 * Clues and answer buttons for one daily card.
 * A general row takes its sport from the buttons, so hockey answers cannot sit under football copy.
 */
export function alignDailyPresentation(input: DailyPresentation): {
  category: string;
  clues: string[];
  options: string[];
} {
  const mapped = SPORT_CHOICES[choiceSportKey(input.category)] ? choiceSportKey(input.category) : null;
  const sport = mapped ?? inferOptionSport(input.options);
  const category = mapped ? input.category : sport ? (CATEGORY_LABEL[sport] ?? input.category) : input.category;
  return {
    category,
    clues: publishDailyClues(input.id, input.clues, sport ?? input.category),
    options: ensureFourDailyOptions(input.options, sport ?? input.category, input.id),
  };
}
