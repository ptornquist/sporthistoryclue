import { describe, expect, it } from "vitest";
import { readStoredLanguage } from "./LanguageContext";

function fakeStorage(initial: Record<string, string> = {}) {
  const bag = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => bag.get(key) ?? null,
    setItem: (key: string, value: string) => {
      bag.set(key, value);
    },
  };
}

describe("readStoredLanguage", () => {
  it("defaults to Swedish when nothing is stored", () => {
    expect(readStoredLanguage(fakeStorage())).toBe("sv");
    expect(readStoredLanguage(null)).toBe("sv");
  });

  it("reads a stored English choice", () => {
    expect(readStoredLanguage(fakeStorage({ shc_language: "en" }))).toBe("en");
  });

  it("ignores unknown values", () => {
    expect(readStoredLanguage(fakeStorage({ shc_language: "fr" }))).toBe("sv");
  });
});
