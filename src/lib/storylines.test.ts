import { describe, expect, it } from "vitest";
import { arenaHref, firstOpenMatch, nextStorylineMatch, storylineById } from "./storylines";

describe("storyline routing", () => {
  it("points each fixture at that match and campaign", () => {
    expect(arenaHref("comaneci-1976", "olympic-miracles")).toBe(
      "/?match=comaneci-1976&campaign=olympic-miracles",
    );
    expect(arenaHref("bolt-beijing-2008")).toBe("/?match=bolt-beijing-2008");
  });

  it("starts a campaign on the first unsolved fixture", () => {
    const storyline = storylineById("olympic-miracles");
    expect(storyline).toBeTruthy();
    const next = firstOpenMatch(storyline!.matches, { "comaneci-1976": { score: 8000 } });
    expect(next?.key).toBe("dream-team-1992");
    expect(firstOpenMatch(storyline!.matches, {})?.key).toBe("comaneci-1976");
  });

  it("walks to the next fixture in the storyline", () => {
    expect(nextStorylineMatch("cold-war-on-ice", "miracle-on-ice-1980")?.key).toBe("summit-series-1972");
    expect(nextStorylineMatch("cold-war-on-ice", "summit-series-1972")).toBeNull();
  });
});
