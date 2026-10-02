import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ArchiveMonth } from "./ArchiveMonth";
import { ClueStack } from "./ClueStack";
import { DateSwitcher } from "./DateSwitcher";
import { SolvedFixtureCard } from "./SolvedFixtureCard";

describe("DateSwitcher", () => {
  it("shows yesterday, today, and the calendar, and steps forward only from yesterday", () => {
    const today = renderToStaticMarkup(
      createElement(DateSwitcher, {
        todayKey: "2026-10-02",
        activeKey: "2026-10-02",
        onYesterday: vi.fn(),
        onToday: vi.fn(),
        onForward: vi.fn(),
      }),
    );
    expect(today).toContain("&lt; Yesterday");
    expect(today).toContain("Today");
    expect(today).toContain("📅 Calendar");
    expect(today).toContain('href="/archive"');
    expect(today).not.toContain("Step forward to today");

    const yesterday = renderToStaticMarkup(
      createElement(DateSwitcher, {
        todayKey: "2026-10-02",
        activeKey: "2026-10-01",
        onYesterday: vi.fn(),
        onToday: vi.fn(),
        onForward: vi.fn(),
      }),
    );
    expect(yesterday).toContain("Step forward to today");
    expect(yesterday).toContain("&gt;");
  });
});

describe("ClueStack", () => {
  const clues = ["Rink", "Cold War", "Line", "Photo", "Quote"];

  it("starts on the arena card and offers one reveal button", () => {
    const html = renderToStaticMarkup(
      createElement(ClueStack, { clues, revealedIndex: 0, locked: false, onReveal: vi.fn() }),
    );
    expect(html).toContain("Card #1: Arena &amp; Stakes");
    expect(html).toContain("Rink");
    expect(html).not.toContain("Era &amp; Context");
    expect(html).toContain("REVEAL NEXT CLUE (-1,500 PTS)");
    expect(html).toContain("shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]");
  });

  it("stacks unlocked cards and hides the button after the fifth clue", () => {
    const html = renderToStaticMarkup(
      createElement(ClueStack, { clues, revealedIndex: 4, locked: false, onReveal: vi.fn() }),
    );
    expect(html).toContain("Card #2: Era &amp; Context");
    expect(html).toContain("Card #3: Lineup &amp; Tactics");
    expect(html).toContain("Card #4: Archive Photo");
    expect(html).toContain("Card #5: The Climax");
    expect(html).not.toContain("REVEAL NEXT CLUE");
  });
});

describe("SolvedFixtureCard", () => {
  it("replaces the guess grid with the solved summary", () => {
    const html = renderToStaticMarkup(
      createElement(SolvedFixtureCard, {
        sport: "Ice Hockey",
        year: 1980,
        score: 8500,
        cells: ["🟩", "⬜", "⬜", "⬜", "⬜"],
        streak: 3,
        onShare: vi.fn(),
      }),
    );
    expect(html).toContain("Fixture Solved!");
    expect(html).toContain("Ice Hockey (1980)");
    expect(html).toContain("8,500 PTS");
    expect(html).toContain("🟩");
    expect(html).toContain("🔥 3-Day Streak");
    expect(html).toContain("Share Result");
  });
});

describe("ArchiveMonth", () => {
  it("links the month, with today returning to the live drop", () => {
    const html = renderToStaticMarkup(createElement(ArchiveMonth, { now: new Date("2026-10-02T12:00:00.000Z") }));
    expect(html).toContain("October 2026");
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/?date=2026-10-01"');
    expect(html).not.toContain('href="/?date=2026-10-03"');
  });
});
