import { describe, expect, it } from "vitest";
import {
  activeStreak,
  formatCountdown,
  mondayOfUtcWeek,
  msUntilNextUtcMidnight,
  recordSolvedDate,
  shiftUtcDateKey,
  weekDateKeys,
} from "./utc-streak";

describe("midnight countdown", () => {
  it("counts down to the next 00:00:00 UTC", () => {
    const now = new Date(Date.UTC(2026, 8, 26, 10, 35, 51));
    const remaining = msUntilNextUtcMidnight(now);
    expect(formatCountdown(remaining)).toBe("13 : 24 : 09");
  });

  it("pads each unit and lands on zero at midnight", () => {
    expect(formatCountdown(1000)).toBe("00 : 00 : 01");
    expect(formatCountdown(0)).toBe("00 : 00 : 00");
    const midnight = new Date(Date.UTC(2026, 8, 27, 0, 0, 0));
    expect(formatCountdown(msUntilNextUtcMidnight(midnight))).toBe("24 : 00 : 00");
  });
});

describe("weekly streak", () => {
  it("starts the week on Monday", () => {
    expect(mondayOfUtcWeek("2024-01-01")).toBe("2024-01-01");
    expect(mondayOfUtcWeek("2024-01-07")).toBe("2024-01-01");
    expect(weekDateKeys("2026-09-26")).toEqual([
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
    ]);
  });

  it("counts consecutive days through today and keeps yesterday alive", () => {
    expect(activeStreak(["2026-09-24", "2026-09-25", "2026-09-26"], "2026-09-26")).toBe(3);
    expect(activeStreak(["2026-09-20", "2026-09-26"], "2026-09-26")).toBe(1);
    expect(activeStreak(["2026-09-25"], "2026-09-26")).toBe(1);
    expect(activeStreak([], "2026-09-26")).toBe(0);
    expect(shiftUtcDateKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("records a date once", () => {
    const first = recordSolvedDate("2026-09-26", []);
    const second = recordSolvedDate("2026-09-26", first);
    expect(second).toEqual(["2026-09-26"]);
    expect(recordSolvedDate("2026-09-25", second)).toEqual(["2026-09-25", "2026-09-26"]);
  });
});
