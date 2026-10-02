import { describe, expect, it, vi } from "vitest";
import { cleanScoutQuery, searchScouts } from "./network";

describe("searchScouts", () => {
  it("strips a leading @ and matches usernames", async () => {
    expect(cleanScoutQuery("  @ptornquist ")).toBe("ptornquist");

    const limit = vi.fn(async () => ({
      data: [{ id: "s1", username: "ptornquist", career_score: 7500, fixtures_cleared: 4 }],
      error: null,
    }));
    const neq = vi.fn(() => ({ limit }));
    const ilike = vi.fn(() => ({ neq, limit }));
    const select = vi.fn(() => ({ ilike }));
    const from = vi.fn(() => ({ select }));

    const rows = await searchScouts("@ptornquist", "self", { from } as never);

    expect(from).toHaveBeenCalledWith("profiles");
    expect(select).toHaveBeenCalledWith("id, username, career_score, fixtures_cleared");
    expect(ilike).toHaveBeenCalledWith("username", "%ptornquist%");
    expect(neq).toHaveBeenCalledWith("id", "self");
    expect(limit).toHaveBeenCalledWith(10);
    expect(rows[0]?.username).toBe("ptornquist");
  });

  it("skips an empty handle", async () => {
    const from = vi.fn();
    await expect(searchScouts(" @ ", undefined, { from } as never)).resolves.toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });
});
