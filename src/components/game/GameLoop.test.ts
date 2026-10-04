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
    expect(today).toContain("&lt; Igår");
    expect(today).toContain("Idag");
    expect(today).toContain("📅 Kalender");
    expect(today).toContain('href="/archive"');
    expect(today).not.toContain("Gå fram till idag");

    const yesterday = renderToStaticMarkup(
      createElement(DateSwitcher, {
        todayKey: "2026-10-02",
        activeKey: "2026-10-01",
        onYesterday: vi.fn(),
        onToday: vi.fn(),
        onForward: vi.fn(),
      }),
    );
    expect(yesterday).toContain("Gå fram till idag");
    expect(yesterday).toContain("&gt;");
  });
});

describe("ClueStack", () => {
  const clues = ["Rink", "Cold War", "Line", "Photo", "Quote"];

  it("starts on the arena card and offers one reveal button", () => {
    const html = renderToStaticMarkup(
      createElement(ClueStack, { clues, revealedIndex: 0, locked: false, onReveal: vi.fn() }),
    );
    expect(html).toContain("Kort #1: Arena &amp; förutsättningar");
    expect(html).toContain("Rink");
    expect(html).not.toContain("Epok &amp; sammanhang");
    expect(html).toContain("VISA NÄSTA LEDTRÅD (-1,500 POÄNG)");
    expect(html).toContain("shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]");
  });

  it("stacks unlocked cards and hides the button after the fifth clue", () => {
    const html = renderToStaticMarkup(
      createElement(ClueStack, { clues, revealedIndex: 4, locked: false, onReveal: vi.fn() }),
    );
    expect(html).toContain("Kort #2: Epok &amp; sammanhang");
    expect(html).toContain("Kort #3: Laguppställning &amp; taktik");
    expect(html).toContain("Kort #4: Det avgörande skedet");
    expect(html).toContain("Kort #5: Klimaxet");
    expect(html).not.toContain("VISA NÄSTA LEDTRÅD");
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
        fixtureId: "miracle-on-ice-1980",
        onShare: vi.fn(),
      }),
    );
    expect(html).toContain("Klassiker Avklarad!");
    expect(html).toContain("Ice Hockey (1980)");
    expect(html).toContain("8,500 poäng");
    expect(html).toContain("🟩");
    expect(html).toContain("🔥 3 dagars svit");
    expect(html).toContain("Dela resultat");
    expect(html).toContain("Utmana en vän");
    expect(html.indexOf("Dela resultat")).toBeLessThan(html.indexOf("Utmana en vän"));
    expect(html).toContain("bg-blue-600");
    expect(html).toContain('aria-haspopup="dialog"');
  });
});

describe("ArchiveMonth", () => {
  it("links the month, with today returning to the live drop", () => {
    const html = renderToStaticMarkup(createElement(ArchiveMonth, { now: new Date("2026-10-02T12:00:00.000Z") }));
    expect(html).toContain("oktober 2026");
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/?date=2026-10-01"');
    expect(html).not.toContain('href="/?date=2026-10-03"');
  });
});
