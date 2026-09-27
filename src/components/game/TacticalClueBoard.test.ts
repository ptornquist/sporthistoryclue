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
  it("shows locked category cards and hides the clue text", () => {
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles,
        opened: [],
        imageUrl: null,
        locked: false,
        onReveal: () => undefined,
      }),
    );
    expect(html).toContain("grid-cols-2");
    expect(html).toContain("hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all");
    expect(html).toContain("Arenan &amp; Ramen");
    expect(html).toContain("-1 500 PTS");
    expect(html).toContain("-3 500 PTS");
    expect(html).not.toContain("The rink is loud.");
    expect(html).not.toContain("flooded sheet");
  });

  it("shows the archive description when the photo tile has no image", () => {
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles,
        opened: [3],
        imageUrl: null,
        locked: false,
        onReveal: () => undefined,
      }),
    );
    expect(html).toContain("A flooded sheet under a low roof.");
    expect(html).toContain("✓");
    expect(html).not.toContain("Archive photograph");
  });

  it("shows the unblurred archive photo with a vignette", () => {
    const html = renderToStaticMarkup(
      createElement(TacticalClueBoard, {
        tiles,
        opened: [3],
        imageUrl: "https://cdn.example.com/archive.jpg",
        locked: false,
        onReveal: () => undefined,
      }),
    );
    expect(html).toContain("https://cdn.example.com/archive.jpg");
    expect(html).toContain("radial-gradient");
    expect(html).not.toContain("A flooded sheet under a low roof.");
  });
});
