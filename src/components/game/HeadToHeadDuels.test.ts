import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeadToHeadDuels } from "./HeadToHeadDuels";

describe("HeadToHeadDuels", () => {
  it("lists incoming, sent, and completed duels", () => {
    const html = renderToStaticMarkup(
      createElement(HeadToHeadDuels, {
        myUsername: "beau",
        duels: [
          { id: "1", challenger_username: "ada", opponent_username: "beau", challenge_id: "2026-10-02", opponent_score: null },
          { id: "2", challenger_username: "beau", opponent_username: "cy", challenge_id: "2026-10-02", opponent_score: null },
          {
            id: "3",
            challenger_username: "ada",
            opponent_username: "beau",
            challenger_score: 1000,
            opponent_score: 2500,
            winner_username: "beau",
            challenge_id: "2026-10-01",
          },
        ],
      }),
    );
    expect(html).toContain("Head-to-Head Duels (3)");
    expect(html).toContain("@ada challenged you on 2026-10-02!");
    expect(html).toContain("Accept &amp; Play");
    expect(html).toContain('href="/?date=2026-10-02"');
    expect(html).toContain("You challenged @cy · Waiting for result...");
    expect(html).toContain("👑 @beau");
    expect(html).toContain("2,500 PTS");
  });
});
