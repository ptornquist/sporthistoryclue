import { describe, expect, it } from "vitest";
import { alignDailyPresentation } from "./daily-presentation";
import { dailyClueFitsSport } from "./daily-clue-copy";
import { optionSport } from "./sport-options";

const HOCKEY_OPTIONS = [
  "USA mot Sovjetunionen (1980)",
  "Kanada mot Sovjetunionen (Summit Series) (1972)",
  "Sverige mot Sovjetunionen (1984)",
  "Tjeckoslovakien mot Sovjetunionen (1976)",
];

describe("alignDailyPresentation", () => {
  it("does not leave football copy under hockey answers", () => {
    const aligned = alignDailyPresentation({
      id: "general-row",
      date_key: "2026-10-04",
      category: "general",
      clues: ["Gräset är nyslaget och mittcirkeln redan sliten. Läktaren sjunger före avspark."],
      options: HOCKEY_OPTIONS,
    });
    const text = aligned.clues.join(" ");
    expect(aligned.category).toMatch(/hockey/i);
    expect(aligned.clues).toHaveLength(5);
    expect(text).toMatch(/puck/i);
    expect(text).toMatch(/sarg/i);
    expect(text).toMatch(/period/i);
    expect(text).toMatch(/utvisning/i);
    expect(text).not.toMatch(/avspark|mittcirkel|gräset/i);
    expect(aligned.options.join(" ")).not.toMatch(/Hammarby|Hurst|Pelé|Premier League/i);
    for (const clue of aligned.clues) expect(dailyClueFitsSport(clue, "ice_hockey")).toBe(true);
  });

  it("keeps a football selection on football clues and football classics", () => {
    const aligned = alignDailyPresentation({
      id: "daily-football-2026-10-04",
      date_key: "2026-10-04",
      category: "football",
      clues: ["Gräset är nyslaget och mittcirkeln redan sliten. Läktaren sjunger före avspark."],
      options: HOCKEY_OPTIONS,
    });
    expect(aligned.category).toMatch(/football/i);
    expect(aligned.clues.join(" ")).not.toMatch(/puck|utvisningsbås|blålinj|sarg/i);
    expect(aligned.options).toHaveLength(4);
    expect(aligned.options.every((option) => optionSport(option) === "football")).toBe(true);
    expect(aligned.clues.every((clue) => dailyClueFitsSport(clue, "football"))).toBe(true);
  });
});
