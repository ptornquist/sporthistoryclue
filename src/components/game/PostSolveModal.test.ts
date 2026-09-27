import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostSolveModal, buildSolveShare, celebrateSolve, matchSubtitle, tileMarks } from "./PostSolveModal";

describe("PostSolveModal", () => {
  it("formats a wordle-style share card and the stadium recap", () => {
    const share = buildSolveShare({
      puzzleNumber: 20723,
      sport: "Football",
      score: 8500,
      unlocked: ["arena", "epoch"],
      club: { name: "Arsenal FC", badge: "🔴⚪" },
    });
    expect(share).toBe(
      [
        "SportsHistoryClue #20723 ⚽",
        "Score: 8,500 / 10,000 PTS 🏆",
        "Intel Spent: 2 / 5 Tiles",
        "🟩🟨⬜⬜⬜",
        "Backed: Arsenal FC 🔴⚪",
        "https://sportshistoryclue.com",
      ].join("\n"),
    );
    expect(tileMarks(["arena", "decisive"])).toEqual(["free", "saved", "saved", "saved", "revealed"]);
    expect(matchSubtitle("Football", 1994, "Rose Bowl, Pasadena")).toBe(
      "Football · 1994 · Rose Bowl, Pasadena",
    );

    const html = renderToStaticMarkup(
      createElement(PostSolveModal, {
        open: true,
        onClose: () => undefined,
        score: 8500,
        unlockedTiles: ["arena", "epoch"],
        matchTitle: "1994 World Cup Final: Brazil vs Italy",
        sport: "Football",
        year: 1994,
        puzzleNumber: 20723,
        challengeId: "brazil-italy-1994",
        club: { name: "Arsenal FC", badge: "🔴" },
      }),
    );
    expect(html).toContain(
      "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4",
    );
    expect(html).toContain(
      "bg-white border-[3px] border-zinc-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] relative z-50 text-center animate-in fade-in zoom-in-95 duration-200",
    );
    expect(html).toContain(
      "bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3",
    );
    expect(html).toContain("FIXTURE SOLVED · BULLSEYE");
    expect(html).toContain("1994 World Cup Final: Brazil vs Italy");
    expect(html).toContain("text-4xl sm:text-5xl font-black text-blue-600 tracking-tight my-2");
    expect(html).toContain("+8,500 PTS");
    expect(html).toContain(
      "bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-3 my-4 flex items-center justify-center gap-2",
    );
    expect(html).toContain("<strong>Arsenal FC</strong>");
    expect(html).toContain("bg-emerald-500");
    expect(html).toContain("bg-amber-400");
    expect(html).toContain("SHARE RESULT 📋");
    expect(html).toContain(
      "w-full bg-zinc-900 hover:bg-black text-white font-black py-3.5 rounded-2xl text-sm tracking-wider uppercase shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] hover:shadow-none active:translate-y-[2px] transition-all",
    );
    expect(html).toContain("VIEW FULL MATCH DOSSIER");
  });

  it("stays closed until a correct guess and omits the club line when none is pledged", async () => {
    const closed = renderToStaticMarkup(
      createElement(PostSolveModal, {
        open: false,
        onClose: () => undefined,
        score: 10000,
        unlockedTiles: ["arena"],
        matchTitle: "Hidden",
        sport: "Football",
        year: 1994,
        puzzleNumber: 1,
        challengeId: "x",
        club: null,
      }),
    );
    expect(closed).toBe("");
    const share = buildSolveShare({
      puzzleNumber: 1,
      sport: "Ice Hockey",
      score: 10000,
      unlocked: ["arena"],
      club: null,
    });
    expect(share).toContain("🟩⬜⬜⬜⬜");
    expect(share).not.toContain("Backed:");
    await expect(celebrateSolve()).resolves.toBeUndefined();
  });
});
