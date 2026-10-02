import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StandingsBoard } from "./page";

describe("StandingsBoard", () => {
  it("shows podium cards and the full table when profiles exist, including zero scores", () => {
    const html = renderToStaticMarkup(
      createElement(StandingsBoard, {
        rows: [
          { id: "a", username: "ada", career_score: 0, fixtures_cleared: 0 },
          { id: "b", username: "beau", career_score: 0, fixtures_cleared: 1 },
        ],
      }),
    );
    expect(html).toContain("@ada");
    expect(html).toContain("@beau");
    expect(html).toContain('href="/scout/ada"');
    expect(html).toContain('href="/scout/beau"');
    expect(html).toContain("<table");
    expect(html).toContain("Leader");
    expect(html).not.toContain("No career scores yet");
  });
});
