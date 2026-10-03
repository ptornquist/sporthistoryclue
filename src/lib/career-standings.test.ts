import { describe, expect, it, vi } from "vitest";
import { fetchCareerStandings, placeOwnStanding } from "./career-standings";

describe("fetchCareerStandings", () => {
  it("loads every profile ordered by career score", async () => {
    const order = vi.fn(async () => ({
      data: [
        { id: "a", username: "ada", career_score: 20000, fixtures_cleared: 3 },
        { id: "b", username: "beau", career_score: 8000, fixtures_cleared: 1 },
      ],
      error: null,
    }));
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));
    const rows = await fetchCareerStandings({ from } as never);

    expect(from).toHaveBeenCalledWith("profiles");
    expect(select).toHaveBeenCalledWith("id, username, career_score, fixtures_cleared");
    expect(order).toHaveBeenCalledWith("career_score", { ascending: false });
    expect(rows.map((row) => row.id)).toEqual(["a", "b"]);
  });
});

describe("placeOwnStanding", () => {
  it("replaces this scout's row instead of adding the score again", () => {
    const rows = placeOwnStanding(
      [
        { id: "other", username: "beau", career_score: 50000, fixtures_cleared: 8 },
        { id: "me", username: "ada", career_score: 10000, fixtures_cleared: 1 },
      ],
      { userId: "me", username: "ada", careerScore: 20000, fixturesCleared: 2 },
    );
    expect(rows.map((row) => [row.id, row.career_score, row.fixtures_cleared])).toEqual([
      ["other", 50000, 8],
      ["me", 20000, 2],
    ]);
  });

  it("shows the local total when the board has no server row", () => {
    const rows = placeOwnStanding([], {
      userId: null,
      username: null,
      careerScore: 20000,
      fixturesCleared: 2,
    });
    expect(rows).toEqual([
      { id: "local-scout", username: "Du", career_score: 20000, fixtures_cleared: 2 },
    ]);
  });
});
