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
    expect(html).toContain("border-[2.5px] shadow-[3px_3px_0px_0px_rgba(24,24,27,0.85)] hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] active:translate-y-[2px] transition-all rounded-2xl p-4");
    expect(html).toContain("bg-emerald-50/90 border-emerald-600 text-emerald-950");
    expect(html).toContain("bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wider uppercase");
    expect(html).toContain("bg-amber-50/90 border-amber-600 text-amber-950");
    expect(html).toContain("bg-rose-50/90 border-rose-600 text-rose-950");
    expect(html).toContain("ring-4 ring-zinc-900/30 -translate-y-1 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)]");
    expect(html).toContain("FREE / UNLOCKED");
    expect(html).toContain("ACTIVE INTEL: 🏟️ The Arena &amp; Stakes");
    expect(html).toContain("border-[3px] border-zinc-900 bg-white rounded-3xl p-6 md:p-8 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] relative overflow-hidden mt-6 mb-8");
    expect(html).toContain("bg-zinc-900 text-white font-black px-3 py-1 rounded-lg text-xs uppercase tracking-wider inline-flex items-center gap-1.5 mb-3");
    expect(html).toContain("text-zinc-900 text-lg md:text-xl font-semibold leading-relaxed tracking-tight");
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
    expect(html).toContain("border-2 border-zinc-900 rounded-xl overflow-hidden");
    expect(html).toContain("Archive photograph");
    expect(html).toContain("A flooded sheet under a low roof.");
  });
});
