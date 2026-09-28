import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildTacticalBoard } from "@/lib/tactical-board";
import { CLUE_CARD, CLUE_TEXT, LOCKED_STEP, TacticalClueBoard, UNLOCKED_STEP, unlockPrompt } from "./TacticalClueBoard";

const tiles = buildTacticalBoard([
  "The rink is loud.",
  "A winter of amateurs.",
  "A college line.",
  "A flooded sheet under a low roof.",
  "The captain finishes it.",
]);

describe("TacticalClueBoard", () => {
  it("opens the free arena clue on a chunky step bar", () => {
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles,
        unlocked: ["arena"],
        activeId: "arena",
        imageUrl: null,
        locked: false,
        onSelect: () => undefined,
      }),
    );
    expect(html).toContain(UNLOCKED_STEP);
    expect(html).toContain(LOCKED_STEP);
    expect(html).toContain("1 🏟️");
    expect(html).toContain("2 ⏱️");
    expect(html).toContain("3 📋");
    expect(html).toContain("4 📷");
    expect(html).toContain("5 ⚡");
    expect(html).toContain(CLUE_CARD);
    expect(html).toContain("CLUE 1: THE ARENA");
    expect(html).toContain(CLUE_TEXT);
    expect(html).toContain("The rink is loud.");
    expect(html).not.toContain("Review the opening briefing below.");
    expect(html).not.toContain("A winter of amateurs.");
    expect(html).not.toContain("flooded sheet");
    expect(html).not.toContain("Unlock (-1,500 pts)");
  });

  it("shows the unlock cost the moment a locked step is prompted", () => {
    expect(unlockPrompt(1500)).toBe("Unlock (-1,500 pts)");
    expect(unlockPrompt(3500)).toBe("Unlock (-3,500 pts)");
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles,
        unlocked: ["arena"],
        activeId: "arena",
        imageUrl: null,
        locked: false,
        onSelect: () => undefined,
        initialCostPrompt: 1,
      }),
    );
    expect(html).toContain("Unlock (-1,500 pts)");
    expect(html).not.toContain("A winter of amateurs.");
  });

  it("shows the selected paid clue", () => {
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles,
        unlocked: ["arena", "epoch"],
        activeId: "epoch",
        imageUrl: null,
        locked: false,
        onSelect: () => undefined,
      }),
    );
    expect(html).toContain("CLUE 2: THE ERA");
    expect(html).toContain("A winter of amateurs.");
    expect(html).not.toContain("The rink is loud.");
  });

  it("resolves keyed tactical clues into the active clue card", () => {
    const blank = buildTacticalBoard([]);
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles: blank,
        unlocked: ["arena", "epoch"],
        activeId: "epoch",
        imageUrl: null,
        locked: false,
        onSelect: () => undefined,
        tacticalClues: {
          stadium: "The bowl is already full.",
          context: "Late in a tense decade.",
        },
      }),
    );
    expect(html).toContain("CLUE 2: THE ERA");
    expect(html).toContain("Late in a tense decade.");
    expect(html).not.toContain("The bowl is already full.");
    expect(html).not.toContain("Nothing further is filed on this tile.");
  });

  it("shows the archive description when the photo tile has no image", () => {
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles,
        unlocked: ["arena", "archive"],
        activeId: "archive",
        imageUrl: null,
        imageMissing: true,
        locked: false,
        onSelect: () => undefined,
      }),
    );
    expect(html).toContain("CLUE 4: THE PHOTO");
    expect(html).toContain("A flooded sheet under a low roof.");
    expect(html).not.toContain("Archive photograph");
  });

  it("fits the archive photo inside the clue card and starts it blurred", () => {
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles,
        unlocked: ["archive"],
        activeId: "archive",
        imageUrl: "https://cdn.example.com/archive.jpg",
        locked: false,
        onSelect: () => undefined,
      }),
    );
    expect(html).toContain("https://cdn.example.com/archive.jpg");
    expect(html).toContain("max-h-full min-h-0 w-full flex-1 object-contain");
    expect(html).toContain("blur-xl scale-105 filter grayscale contrast-125");
    expect(html).toContain("duration-700 ease-out");
    expect(html).toContain("Archive photograph");
    expect(html).toContain("A flooded sheet under a low roof.");
    expect(html).toContain(CLUE_CARD);
  });
});
