import { describe, expect, it } from "vitest";
import { isGuestOpenDrop, shiftUtcDateKey, utcDateKey } from "./drop-dates";

describe("isGuestOpenDrop", () => {
  const now = new Date("2026-10-02T15:00:00.000Z");

  it("opens today and yesterday for guests", () => {
    expect(utcDateKey(now)).toBe("2026-10-02");
    expect(isGuestOpenDrop("2026-10-02", now)).toBe(true);
    expect(isGuestOpenDrop("2026-10-01", now)).toBe(true);
    expect(isGuestOpenDrop("2026-09-30", now)).toBe(false);
  });

  it("steps a date key without shifting the calendar day", () => {
    expect(shiftUtcDateKey("2026-10-01", 1)).toBe("2026-10-02");
    expect(shiftUtcDateKey("2026-10-02", -1)).toBe("2026-10-01");
  });
});
