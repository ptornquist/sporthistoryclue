import { describe, expect, it } from "vitest";
import { alternateUsername, handleFromEmail, profileFromRow, profileInsertPayload, type ScoutProfileRow } from "./ensure-profile";

const fallback: ScoutProfileRow = {
  id: "user-1",
  username: "scout",
  display_name: "scout",
  avatar_url: null,
  streak: 0,
  total_score: 0,
  favorite_club: null,
  hockey_club: null,
  football_club: null,
  international_club: null,
  locale: "sv",
  country: "world",
};

describe("default scout profile", () => {
  it("builds a handle from the email and falls back when the address is empty", () => {
    expect(handleFromEmail("Ada.Scout@example.com")).toBe("adascout");
    expect(handleFromEmail("")).toBe("scout");
    expect(handleFromEmail(null)).toBe("scout");
  });

  it("keeps a missing database row on the local language, country, and club defaults", () => {
    expect(profileFromRow({}, fallback)).toEqual(fallback);
    const saved = profileFromRow(
      { id: "user-1", username: "ada", locale: "en", country: "se", favorite_club: "aik", streak: 2, total_score: 400 },
      fallback,
    );
    expect(saved.username).toBe("ada");
    expect(saved.locale).toBe("en");
    expect(saved.country).toBe("se");
    expect(saved.favorite_club).toBe("aik");
    expect(saved.football_club).toBe("aik");
    expect(saved.hockey_club).toBeNull();
    expect(saved.streak).toBe(2);
    expect(saved.total_score).toBe(400);
  });

  it("creates a default row without optional columns when the database row is missing", () => {
    expect(profileInsertPayload({ id: "user-1", username: "" })).toEqual({ id: "user-1", username: "scout" });
    expect(profileInsertPayload(fallback)).toEqual({ id: "user-1", username: "scout" });
    expect(alternateUsername("adascout", "1234abcd-0000")).toBe("adascout_1234ab");
  });
});
