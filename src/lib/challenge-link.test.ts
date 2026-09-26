import { describe, expect, it } from "vitest";
import { buildChallengeLink, ogChallengeHeadline, publicFixtureName } from "./challenge-link";

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
    expect(publicFixtureName("miracle-1980")).toBe("The Lake Placid Frequency");
    expect(ogChallengeHeadline("alex", "The Lake Placid Frequency")).toBe(
      "CHALLENGE FROM @alex ON 'The Lake Placid Frequency'",
    );
    expect(ogChallengeHeadline("", null)).toBe("Test Your Sports History IQ");
  });
});
