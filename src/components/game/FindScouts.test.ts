import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ScoutSearchResults, default as FindScouts } from "./FindScouts";

describe("Find Scouts", () => {
  it("renders the search form", () => {
    const html = renderToStaticMarkup(createElement(FindScouts));
    expect(html).toContain("Find Scouts");
    expect(html).toContain('placeholder="Find Scouts by @username"');
    expect(html).toContain(">Search<");
    expect(html).not.toContain("Searching scouts...");
  });

  it("shows a miss, then a scout card with points, matches, and follow", () => {
    const empty = renderToStaticMarkup(
      createElement(ScoutSearchResults, {
        searching: false,
        query: "ptornquist",
        results: [],
        followingIds: [],
        onToggleFollow: vi.fn(),
      }),
    );
    expect(empty).toContain("No scout found matching &#x27;@ptornquist&#x27;");

    const hit = renderToStaticMarkup(
      createElement(ScoutSearchResults, {
        searching: true,
        query: "ptornquist",
        results: [{ id: "s1", username: "@ptornquist", career_score: 7500, fixtures_cleared: 4 }],
        followingIds: [],
        onToggleFollow: vi.fn(),
      }),
    );
    expect(hit).toContain("Searching scouts...");
    expect(hit).toContain("@ptornquist");
    expect(hit).toContain('href="/scout/ptornquist"');
    expect(hit).toContain("hover:underline");
    expect(hit).toContain("7,500 PTS · 4 matches");
    expect(hit).toContain(">Follow<");
  });

  it("offers a challenge when the row is another scout", () => {
    const html = renderToStaticMarkup(
      createElement(ScoutSearchResults, {
        searching: false,
        query: "ada",
        results: [
          { id: "s1", username: "ada", career_score: 100, fixtures_cleared: 1 },
          { id: "s2", username: "beau", career_score: 50, fixtures_cleared: 0 },
        ],
        followingIds: [],
        currentUsername: "beau",
        onToggleFollow: vi.fn(),
        onChallenge: vi.fn(),
      }),
    );
    expect(html).toContain("⚔️ Challenge");
    expect(html.match(/⚔️ Challenge/g)?.length).toBe(1);
  });
});