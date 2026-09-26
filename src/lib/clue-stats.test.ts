import { describe, expect, it } from "vitest";
import { barWidth, baselineDistribution, sharePercent } from "./clue-stats";
import { recapForId } from "./recaps";
import { videoEmbedSrc } from "./video-embed";

describe("baselineDistribution", () => {
  it("is stable for the same fixture and never empty", () => {
    const first = baselineDistribution("summit-series-1972");
    const second = baselineDistribution("summit-series-1972");
    expect(second).toEqual(first);
    expect(first.total_solves).toBeGreaterThan(0);
    expect(first.clue_1 + first.clue_2 + first.clue_3 + first.clue_4 + first.clue_5 + first.clue_6 + first.missed).toBe(
      first.total_solves,
    );
  });

  it("changes the spread when the fixture changes", () => {
    expect(baselineDistribution("miracle-on-ice-1980")).not.toEqual(baselineDistribution("bolt-beijing-2008"));
  });
});

describe("bar math", () => {
  it("sizes a bar against the longest row and prints a share of the field", () => {
    expect(barWidth(50, 100)).toBe(50);
    expect(barWidth(0, 100)).toBe(0);
    expect(sharePercent(25, 200)).toBe(13);
  });
});

describe("recapForId", () => {
  it("resolves archive aliases to the same decisive moment", () => {
    const recap = recapForId("miracle-1980");
    expect(recap?.year).toBe(1980);
    expect(recap?.venue).toContain("Lake Placid");
    expect(recap?.story.split(".").filter(Boolean).length).toBeGreaterThanOrEqual(3);
  });
});

describe("videoEmbedSrc", () => {
  it("turns a YouTube watch link into an embed and leaves articles as links", () => {
    expect(videoEmbedSrc("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
    expect(videoEmbedSrc("https://www.olympics.com/en/news/miracle-on-ice")).toBeNull();
  });
});
