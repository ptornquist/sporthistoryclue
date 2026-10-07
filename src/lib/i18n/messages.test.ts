import { describe, expect, it } from "vitest";
import { englishSurface } from "./english-surface";
import { publishedEnglishClues } from "./english-clues";
import { en } from "./en";
import { formatMessage } from "./format";
import { sv } from "./sv";
import { optionMatchesChallenge } from "../decoy-options";
import { presentClues } from "../present-clues";
import { publishedSwedishClues } from "../sport-kluringar-pool";
import type { Messages } from "./types";

function paths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("interface copy", () => {
  it("keeps Swedish and English on the same keys", () => {
    const swedish = paths(sv as Messages);
    const english = paths(en as Messages);
    expect(english.sort()).toEqual(swedish.sort());
    expect(swedish.every((key) => key.length > 0)).toBe(true);
  });

  it("keeps the published Swedish menu, button, and score labels", () => {
    expect(sv.nav.daily).toBe("Dagens kluring");
    expect(sv.nav.login).toBe("Logga in");
    expect(sv.nav.openMenu).toBe("Öppna menyn");
    expect(sv.play.openCalendar).toBe("📅 Öppna kalendern");
    expect(sv.play.backToday).toBe("← Tillbaka till idag");
    expect(sv.play.fullCalendar).toBe("📅 Hela kalendern");
    expect(sv.play.revealNext).toBe("Visa nästa ledtråd (−1 500 poäng)");
    expect(sv.play.identify).toBe("Vilken klassiker är det här?");
    expect(sv.play.possibleScore).toBe("Möjlig poäng");
    expect(formatMessage(sv.play.clueProgress, { current: 1, total: 5 })).toBe("Ledtråd 1 av 5");
    expect(sv.scope.sweden).toBe("Sverige");
    expect(sv.scope.international).toBe("Internationellt");
  });

  it("switches authored clues and still grades the English option", () => {
    const ids = ["miracle-1980", "athens-1896", "sverige-sovjet-1984", "leicester-2016"];
    for (const id of ids) {
      expect(publishedEnglishClues(id)).toHaveLength(5);
      expect(publishedSwedishClues(id)).toHaveLength(5);
      const english = presentClues(id, ["unused"], undefined, "en").join(" ");
      const swedish = presentClues(id, ["unused"], undefined, "sv").join(" ");
      expect(english).not.toBe(swedish);
    }
    expect(presentClues("athens-1896", [], undefined, "en")[4]).toContain("Spyridon Louis");
    expect(englishSurface("1972 OS-hockey: Kanada mot Sovjetunionen")).toBe(
      "1972 Olympic Hockey: Canada vs Soviet Union",
    );
    expect(optionMatchesChallenge("1972 Olympic Hockey: Canada vs Soviet Union", {
      subject: "Canada vs Soviet Union (1972)",
      year: 1972,
      category: "Olympic Hockey",
      sport: "ice_hockey",
    })).toBe(true);
  });

  it("translates the same chrome into English", () => {
    expect(en.nav.daily).toBe("Daily clue");
    expect(en.play.identify).toBe("Identify the historical matchup");
    expect(en.play.possibleScore).toBe("Possible score");
    expect(en.scope.sweden).toBe("Sweden");
    expect(formatMessage(en.play.clueProgress, { current: 2, total: 6 })).toBe("Clue 2 of 6");
  });
});
