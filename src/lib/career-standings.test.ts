import { describe, expect, it, vi } from "vitest";
import { fetchCareerStandings } from "./career-standings";

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
    expect(select).toHaveBeenCalledWith("*");
    expect(order).toHaveBeenCalledWith("career_score", { ascending: false });
    expect(rows.map((row) => row.id)).toEqual(["a", "b"]);
  });
});
