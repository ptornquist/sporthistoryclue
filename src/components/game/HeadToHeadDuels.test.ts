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
    expect(html).toContain("Huvud-mot-huvud Dueller (3)");
    expect(html).toContain("@ada");
    expect(html).toContain('href="/scout/ada"');
    expect(html).toContain("utmanade dig på 2026-10-02!");
    expect(html).toContain("Acceptera &amp; spela");
    expect(html).toContain('href="/?date=2026-10-02"');
    expect(html).toContain("Du utmanade ");
    expect(html).toContain('href="/scout/cy"');
    expect(html).toContain("Väntar på resultat...");
    expect(html).toContain("👑 ");
    expect(html).toContain('href="/scout/beau"');
    expect(html).toContain("2,500 poäng");
  });
});
