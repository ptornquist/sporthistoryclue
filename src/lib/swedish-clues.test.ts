import { describe, expect, it } from "vitest";
import { localizeDailyClue } from "./swedish-clues";

describe("localizeDailyClue", () => {
  it("rewrites Lake Placid and tennis-court English into Swedish", () => {
    expect(localizeDailyClue("Arena: Lake Placid")).toBe("Arena: bergsbyn");
    expect(localizeDailyClue("Arkivbilden dras ut: Olympic Field House i Lake Placid.")).toBe(
      "Arkivbilden dras ut: olympiahallen i bergsbyn.",
    );
    expect(
      localizeDailyClue(
        "En drömduell på Centre Court mellan två raka motsatser: den stoiske baslinjemästaren mot spelaren från New York.",
      ),
    ).toBe(
      "En drömduell på huvudbanan mellan två raka motsatser: den stoiske baslinjemästaren mot spelaren från andra sidan Atlanten.",
    );
    expect(localizeDailyClue("Amateurs against a professional machine. Olympic Field House, Lake Placid.")).toBe("");
    expect(localizeDailyClue("8,500 roaring spectators")).toBe("");
  });
});
