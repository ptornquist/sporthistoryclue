import { describe, expect, it } from "vitest";
import { getClueContent, resolveTacticalClueList } from "./tactical-clues";

const miracleKeys = {
  climax: "Do you believe in miracles? YES!",
  image_clue: "Cropped Olympic ice",
  lineup: "Herb Brooks collegians",
  era: "Cold War winter, 1980",
  arena: "Olympic Field House, Lake Placid",
};

describe("getClueContent", () => {
  it("maps tile 0 to arena and tile 4 to climax even when climax is declared first", () => {
    expect(getClueContent(miracleKeys, 0)).toBe("Olympic Field House, Lake Placid");
    expect(getClueContent(miracleKeys, 1)).toBe("Cold War winter, 1980");
    expect(getClueContent(miracleKeys, 2)).toBe("Herb Brooks collegians");
    expect(getClueContent(miracleKeys, 3)).toBe("Cropped Olympic ice");
    expect(getClueContent(miracleKeys, 4)).toBe("Do you believe in miracles? YES!");
  });

  it("reads the same order from a JSON string", () => {
    expect(getClueContent(JSON.stringify(miracleKeys), 0)).toContain("Lake Placid");
    expect(getClueContent(JSON.stringify(miracleKeys), 4)).toContain("miracles");
  });
});

describe("resolveTacticalClueList", () => {
  it("does not reverse a ladder that is already arena-first", () => {
    const ladder = ["Arena line", "Era line", "Lineup line", "Photo line", "Climax line"];
    expect(resolveTacticalClueList(ladder)).toEqual(ladder);
  });

  it("keeps storyline clue objects arena-first and the quote at the last tile", () => {
    const clues = [
      { kind: "image", kicker: "Plate 11 — crop", image: { plateId: "ice-rink" } },
      {
        kind: "text",
        kicker: "Field note",
        body: "Amateurs against a professional machine. Olympic Field House, Lake Placid.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [{ label: "Score", value: "4–3" }],
      },
      { kind: "quote", kicker: "Wireless", quote: "Do you believe in miracles? YES!" },
      { kind: "image", kicker: "Plate 11 — pull back", image: { plateId: "ice-rink" } },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Herb Brooks's team of collegians.",
      },
    ];

    const resolved = resolveTacticalClueList(clues);
    expect(resolved[0]).toContain("Lake Placid");
    expect(resolved[1]).toContain("Herb Brooks");
    expect(resolved[2]).toContain("4–3");
    expect(resolved[3]).toContain("Plate 11");
    expect(resolved[4]).toBe("Do you believe in miracles? YES!");
    expect(resolved[0]?.includes("miracles")).toBe(false);
  });
});
