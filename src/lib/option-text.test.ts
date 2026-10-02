import { describe, expect, it } from "vitest";
import { distinctOptionValues, formatOptionText, optionIdentity } from "./option-text";

describe("formatOptionText", () => {
  it("strips sport prefixes and underscores", () => {
    expect(formatOptionText("1980 ice_hockey: USA vs Soviet Union")).toBe("USA vs Soviet Union");
    expect(formatOptionText("ice_hockey: USA vs Soviet Union")).toBe("USA vs Soviet Union");
    expect(formatOptionText("USA_vs_Soviet_Union")).toBe("USA vs Soviet Union");
    expect(formatOptionText("")).toBe("");
  });
});

describe("distinctOptionValues", () => {
  it("returns four options and collapses near-duplicates", () => {
    const options = distinctOptionValues(
      [
        "1980 ice_hockey: USA vs Soviet Union",
        "USA vs Soviet Union",
        "USA vs Soviet Union (1980)",
        "1980 Lake Placid: USA vs Soviet Union",
        "1972 ice_hockey: Canada vs Soviet Union",
        "Canada vs Soviet Union (1972)",
        "1992 basketball: USA Dream Team vs Croatia",
        "1974 boxing: Muhammad Ali vs George Foreman",
      ],
      4,
    );

    expect(options).toHaveLength(4);
    expect(new Set(options.map((option) => optionIdentity(option))).size).toBe(4);
    expect(optionIdentity(options[0] ?? "")).toBe("usa vs soviet union");
    expect(options.map((option) => optionIdentity(option))).not.toContain("usa vs soviet union (1980)");
  });
});
