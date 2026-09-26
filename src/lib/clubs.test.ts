import { describe, expect, it } from "vitest";
import {
  activityLine,
  generateClubCode,
  inviteClubLink,
  normalizeClubCode,
  normalizeClubName,
  rankClubMembers,
  safeReturnPath,
  type ClubMember,
} from "./clubs";

describe("private scout clubs", () => {
  it("builds a six-character invite code and a join link", () => {
    expect(generateClubCode(Uint8Array.from([0, 1, 2, 3, 4, 5]))).toBe("ABCDEF");
    expect(normalizeClubCode(" hockey ")).toBe("HOCKEY");
    expect(normalizeClubCode("OLYMP9")).toBe("OLYMP9");
    expect(normalizeClubCode("nope")).toBeNull();
    expect(inviteClubLink("HOCKEY")).toBe("https://sportshistoryclue.com/clubs?join=HOCKEY");
    expect(normalizeClubName("  Locker Room Legends ")).toBe("Locker Room Legends");
  });

  it("writes a solve line and keeps the return path on the site", () => {
    expect(
      activityLine({
        username: "@alex",
        kind: "solve",
        label: "today's Daily Drop",
        score: 8500,
      }),
    ).toBe("@alex solved today's Daily Drop (8,500 PTS)");
    expect(safeReturnPath("/clubs?join=HOCKEY")).toBe("/clubs?join=HOCKEY");
    expect(safeReturnPath("https://evil.example")).toBeNull();
  });

  it("orders the club table by career points", () => {
    const members: ClubMember[] = [
      member("b", 100),
      member("a", 8500),
      member("c", 100),
    ];
    expect(rankClubMembers(members).map((row) => row.username)).toEqual(["a", "b", "c"]);
  });
});

function member(username: string, totalScore: number): ClubMember {
  return {
    id: username,
    username,
    totalScore,
    streak: 1,
    matchesSolved: 1,
    equippedTitle: null,
    equippedFrame: null,
    avatarUrl: null,
    role: "member",
  };
}
