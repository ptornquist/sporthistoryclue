import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DailyDropArena } from "./DailyDropArena";

const fixture = {
  id: "miracle-1980",
  date_key: "2026-09-27",
  category: "Ice hockey",
  clues: [
    "The rink is loud and the favorite is heavy.",
    "A cold-war winter.",
    "A college line that will not sit.",
    "A flooded sheet under a low roof.",
    "The captain finishes the night.",
    "The final is 4–3.",
  ],
  options: ["1980 Olympics: USA vs Soviet Union", "1984 Olympics: USA vs Canada"],
};

describe("DailyDropArena tactical board", () => {
  it("opens on 10 000 points with locked tiles and the guess options underneath", () => {
    const html = renderToStaticMarkup(createElement(DailyDropArena, { initialFixture: fixture }));
    expect(html).toContain("Taktiktavlan");
    expect(html).toContain("10 000");
    expect(html).toContain("Arenan &amp; Ramen");
    expect(html).toContain("-1 000 PTS");
    expect(html).toContain("-3 500 PTS");
    expect(html).toContain("Identify the Historical Matchup");
    expect(html).toContain("1980 Olympics: USA vs Soviet Union");
    expect(html.indexOf("Taktiktavlan")).toBeLessThan(html.indexOf("Identify the Historical Matchup"));
    expect(html).not.toContain("The rink is loud");
    expect(html).not.toContain("Reveal Next Clue");
    expect(html).not.toContain("Yesterday");
  });
});
