import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChallengeFriendModal } from "@/components/ChallengeFriendModal";
import { ClubComposer, ClubStandings } from "@/components/clubs/ClubsBoard";
import type { ClubMember, ClubSummary } from "@/lib/clubs";

describe("club hub markup", () => {
  it("offers create and join before a scout has a club", () => {
    const html = renderToStaticMarkup(
      createElement(ClubComposer, {
        clubName: "",
        joinCode: "HOCKEY",
        busy: false,
        onClubName: () => undefined,
        onJoinCode: () => undefined,
        onCreate: () => undefined,
        onJoin: () => undefined,
      }),
    );
    expect(html).toContain("Create a Club");
    expect(html).toContain("Create Club →");
    expect(html).toContain("Join with Code");
    expect(html).toContain("Join Club →");
    expect(html).toContain("Locker Room Legends");
  });

  it("lists ranked scouts and the invite code", () => {
    const club: ClubSummary = {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Locker Room Legends",
      code: "HOCKEY",
      role: "owner",
      memberCount: 2,
    };
    const members: ClubMember[] = [
      member("alex", "11111111-1111-4111-8111-111111111111", 8500, "owner"),
      member("sam", "22222222-2222-4222-8222-222222222222", 2100, "member"),
    ];
    const html = renderToStaticMarkup(
      createElement(ClubStandings, {
        club,
        members,
        activity: [{ id: "a", line: "@alex solved today's Daily Drop (8,500 PTS)" }],
        viewerId: "22222222-2222-4222-8222-222222222222",
        onCopyInvite: () => undefined,
      }),
    );
    expect(html).toContain("Locker Room Legends");
    expect(html).toContain("HOCKEY");
    expect(html).toContain("Copy Invite Link");
    expect(html).toContain("https://sportshistoryclue.com/clubs?join=HOCKEY");
    expect(html).toContain("ring-2 ring-blue-500/20 bg-blue-50/30");
    expect(html).toContain("@alex solved today&#x27;s Daily Drop (8,500 PTS)");
    expect(html).toContain("Private Club Standings");
  });

  it("adds a club share action to the challenge sheet", () => {
    const html = renderToStaticMarkup(
      createElement(ChallengeFriendModal, {
        isOpen: true,
        onClose: () => undefined,
        matchSlug: "miracle-on-ice-1980",
        matchTitle: "The Lake Placid Frequency",
        userScore: 8500,
      }),
    );
    expect(html).toContain("Share with your Club");
    expect(html).toContain("pts=8500");
  });
});

function member(username: string, id: string, totalScore: number, role: "owner" | "member"): ClubMember {
  return {
    id,
    username,
    totalScore,
    streak: 3,
    matchesSolved: 4,
    equippedTitle: "rookie",
    equippedFrame: "standard",
    avatarUrl: null,
    role,
  };
}
