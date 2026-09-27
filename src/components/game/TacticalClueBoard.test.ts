import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildTacticalBoard } from "@/lib/tactical-board";
import { TacticalClueBoard } from "./TacticalClueBoard";

const tiles = buildTacticalBoard([
  "The rink is loud.",
  "A winter of amateurs.",
  "A college line.",
  "A flooded sheet under a low roof.",
  "The captain finishes it.",
]);

describe("TacticalClueBoard", () => {
  it("opens the free arena clue and hides the paid texts", () => {
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
    expect(html).toContain("grid-cols-2");
    expect(html).toContain("hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all");
    expect(html).toContain("FREE / UNLOCKED");
    expect(html).toContain("ACTIVE INTEL: 🏟️ The Arena &amp; Stakes");
    expect(html).toContain("text-base md:text-lg text-zinc-900 font-medium leading-relaxed bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm");
    expect(html).toContain("Review the opening briefing below.");
    expect(html).toContain("The rink is loud.");
    expect(html).toContain("REVEAL -1,500 PTS");
    expect(html).toContain("REVEAL -3,500 PTS");
    expect(html).not.toContain("REVEAL -1,000 PTS");
    expect(html).not.toContain("A winter of amateurs.");
    expect(html).not.toContain("flooded sheet");
  });

  it("shows tabs and the selected paid clue without repeating its price", () => {
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
    expect(html).toContain("ACTIVE INTEL: ⏱️ Era &amp; Context");
    expect(html).toContain("A winter of amateurs.");
    expect(html).toContain("The Arena &amp; Stakes");
    expect(html).not.toContain("The rink is loud.");
  });

  it("shows the archive description when the photo tile has no image", () => {
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles,
        unlocked: ["arena", "archive"],
        activeId: "archive",
        imageUrl: null,
        locked: false,
        onSelect: () => undefined,
      }),
    );
    expect(html).toContain("A flooded sheet under a low roof.");
    expect(html).not.toContain("Archive photograph");
  });

  it("shows the unblurred archive photo with a vignette and the description", () => {
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
    expect(html).toContain("radial-gradient");
    expect(html).toContain("A flooded sheet under a low roof.");
  });
});
