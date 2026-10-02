import { describe, expect, it } from "vitest";
import {
  buildMonthArchive,
  canAdvanceMonth,
  formatArchiveDate,
  formatScoreBadge,
  upsertCompletion,
} from "./archive-calendar";

describe("archive calendar", () => {
  const today = "2026-09-27";

  it("labels September 2026 and refuses the next month", () => {
    const month = buildMonthArchive(2026, 8, today, []);
    expect(month.label).toBe("SEPTEMBER 2026");
    expect(month.cells[0].status).toBe("pad");
    expect(month.cells[1]).toMatchObject({ dateKey: "2026-09-01", status: "unplayed" });
    expect(month.cells.find((cell) => cell.dateKey === "2026-09-27")?.status).toBe("today");
    expect(month.cells.find((cell) => cell.dateKey === "2026-09-28")?.status).toBe("future");
    expect(month.elapsed).toBe(27);
    expect(canAdvanceMonth(2026, 8, today)).toBe(false);
    expect(canAdvanceMonth(2026, 7, today)).toBe(true);
    expect(formatArchiveDate("2026-09-24")).toBe("24 September 2026");
    expect(formatScoreBadge(8500)).toBe("8.5k");
    expect(formatScoreBadge(10000)).toBe("10k");
  });

  it("marks solved, failed, missed, and unplayed days", () => {
    const month = buildMonthArchive(
      2026,
      8,
      today,
      [
        { dropDate: "2026-09-02", solved: true, score: 8500, challengeId: "miracle-1980" },
        { dropDate: "2026-09-03", solved: false, score: 2000, challengeId: "ali-1974" },
      ],
      new Set(["2026-09-01", "2026-09-02", "2026-09-03"]),
    );

    expect(month.cells.find((cell) => cell.dateKey === "2026-09-02")).toMatchObject({
      status: "solved",
      score: 8500,
      challengeId: "miracle-1980",
    });
    expect(month.cells.find((cell) => cell.dateKey === "2026-09-03")?.status).toBe("failed");
    expect(month.cells.find((cell) => cell.dateKey === "2026-09-04")?.status).toBe("missed");
    expect(month.cells.find((cell) => cell.dateKey === "2026-09-01")?.status).toBe("unplayed");
    expect(month.played).toBe(2);
    expect(month.accuracy).toBe(50);
    expect(month.totalScore).toBe(8500);
  });

  it("keeps a solved day solved when a later miss is recorded", () => {
    const solved = upsertCompletion([], {
      dropDate: "2026-09-02",
      solved: true,
      score: 8500,
      challengeId: "miracle-1980",
    });
    const next = upsertCompletion(solved, {
      dropDate: "2026-09-02",
      solved: false,
      score: 0,
      challengeId: "miracle-1980",
    });
    expect(next).toEqual(solved);
  });
});
