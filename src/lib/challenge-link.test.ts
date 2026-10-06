import { describe, expect, it } from "vitest";
import {
  buildChallengeLink,
  ogChallengeHeadline,
  ogChallengeSubtitle,
  publicFixtureName,
} from "./challenge-link";

describe("challenge links", () => {
  it("builds a pre-solve link and adds a score only after a result", () => {
    expect(buildChallengeLink({ matchSlug: "miracle-on-ice-1980", username: "@alex" })).toBe(
      "https://sportshistoryclue.com/?match=miracle-on-ice-1980&duel=alex",
    );
    expect(
      buildChallengeLink({
        matchSlug: "miracle-on-ice-1980",
        username: "alex",
        userScore: 8500,
        campaignId: "cold-war-on-ice",
      }),
    ).toBe("https://sportshistoryclue.com/?match=miracle-on-ice-1980&duel=alex&pts=8500&campaign=cold-war-on-ice");
  });

  it("names the public fixture on the challenge preview", () => {
    expect(publicFixtureName("miracle-1980")).toBe("The Frozen Miracle");
    expect(ogChallengeHeadline("ptornquist", "The Frozen Miracle")).toBe("UTMANING FRÅN @ptornquist");
    expect(ogChallengeHeadline("@ptornquist", null)).toBe("UTMANING FRÅN @ptornquist");
    expect(ogChallengeHeadline("", null)).toBe("DAGENS KLURING");
    expect(ogChallengeSubtitle(8500)).toBe("Kan du slå hens 8 500 poäng på dagens kluring?");
    expect(ogChallengeSubtitle(10000)).toBe("Kan du slå hens 10 000 poäng på dagens kluring?");
    expect(ogChallengeSubtitle(0)).toBe("Kan du slå hen på dagens kluring?");
  });
});
