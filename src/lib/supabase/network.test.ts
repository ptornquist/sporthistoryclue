import { describe, expect, it, vi } from "vitest";

const { from, insert, followerEq, followingEq, select, selectEq } = vi.hoisted(() => {
  const insert = vi.fn(async () => ({ error: null }));
  const followingEq = vi.fn(async () => ({ error: null }));
  const followerEq = vi.fn(() => ({ eq: followingEq }));
  const selectEq = vi.fn(async () => ({ data: [{ following_id: "scout-2" }], error: null }));
  const select = vi.fn(() => ({ eq: selectEq }));
  const from = vi.fn(() => ({
    insert,
    delete: () => ({ eq: followerEq }),
    select,
  }));
  return { from, insert, followerEq, followingEq, select, selectEq };
});

vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: { from },
}));

import { cleanScoutQuery, followScout, getFollowingIds, searchScouts, unfollowScout } from "./network";

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

  it("writes follow rows on scout_follows", async () => {
    await followScout("me", "them");
    expect(from).toHaveBeenCalledWith("scout_follows");
    expect(insert).toHaveBeenCalledWith({ follower_id: "me", following_id: "them" });

    await unfollowScout("me", "them");
    expect(followerEq).toHaveBeenCalledWith("follower_id", "me");
    expect(followingEq).toHaveBeenCalledWith("following_id", "them");

    await expect(getFollowingIds("me")).resolves.toEqual(["scout-2"]);
    expect(select).toHaveBeenCalledWith("following_id");
    expect(selectEq).toHaveBeenCalledWith("follower_id", "me");
  });

  it("skips an empty handle", async () => {
    const from = vi.fn();
    await expect(searchScouts(" @ ", undefined, { from } as never)).resolves.toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });
});
