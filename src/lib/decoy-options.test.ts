import { describe, expect, it } from "vitest";
import {
  correctOptionLabel,
  fisherYates,
  isUnrelatedEra,
  optionMatchesChallenge,
  selectChallengeOptions,
} from "./decoy-options";

const UNIFORM = /^-?\d+\s+[^:]+:\s+.+/;

describe("selectChallengeOptions", () => {
  it("shuffles a curated decoy list into four uniform options", () => {
    const options = selectChallengeOptions(
      {
        id: "summit-series-1972",
        subject: "Canada vs Soviet Union (1972)",
        year: 1972,
        category: "Summit Series Decider",
        sport: "ice_hockey",
        decoys: [
          "USA vs Finland (1976)",
          "1980 Olympic Hockey: USA vs Soviet Union",
          "Soviet Union vs Czechoslovakia (1968)",
        ],
      },
      () => 0,
    );

    expect(options).toHaveLength(4);
    expect(options.every((option) => UNIFORM.test(option))).toBe(true);
    expect(options).toContain("1972 Summit Series: Canada vs Soviet Union");
    expect(options).toContain("1976 Summit Series: USA vs Finland");
    expect(options).toContain("1980 Olympic Hockey: USA vs Soviet Union");
    expect(options).toContain("1968 Summit Series: Soviet Union vs Czechoslovakia");
    expect(fisherYates(["a", "b", "c", "d"], () => 0)).toEqual(["b", "c", "d", "a"]);
  });

  it("keeps a modern hockey match away from ancient and unrelated fixtures", () => {
    const options = selectChallengeOptions(
      {
        id: "summit-series-1972",
        subject: "Canada vs Soviet Union (1972)",
        year: 1972,
        category: "Olympic Hockey",
        sport: "ice_hockey",
        decoys: [],
        peers: [
          { subject: "Spyridon Louis wins the marathon", year: 1896, category: "Olympics", sport: "athletics" },
          { subject: "The first recorded Games", year: -776, category: "Ancient Olympics", sport: "olympics" },
          { subject: "USA vs Soviet Union", year: 1980, category: "Olympic Hockey", sport: "ice_hockey" },
          { subject: "Brazil vs Italy", year: 1970, category: "World Cup", sport: "football" },
        ],
      },
      () => 0.4,
    );

    expect(options).toHaveLength(4);
    expect(options.join(" | ")).not.toMatch(/1896|-776|marathon|Brazil/);
    expect(options.some((option) => option.includes("1980 Olympic Hockey: USA vs Soviet Union"))).toBe(true);
    expect(options.every((option) => UNIFORM.test(option))).toBe(true);
    expect(options.every((option) => !isUnrelatedEra(1972, Number(option.match(/^-?\d+/)?.[0])))).toBe(true);
    expect(correctOptionLabel({
      subject: "Canada vs Soviet Union (1972)",
      year: 1972,
      category: "Olympic Hockey",
      sport: "ice_hockey",
    })).toBe("1972 Olympic Hockey: Canada vs Soviet Union");
    expect(correctOptionLabel({
      subject: "The Miracle on Ice",
      year: 1980,
      category: "Olympic Medal Round",
      sport: "ice_hockey",
    })).toBe("1980 Olympic Hockey: USA vs Soviet Union");
    expect(correctOptionLabel({
      subject: "Ali defeats Foreman in the Rumble in the Jungle",
      year: 1974,
      category: "Heavyweight Title Fight",
      sport: "boxing",
    })).toBe("1974 Heavyweight Title Fight: Ali vs Foreman");
  });

  it("synthesizes same-sport rivals when the archive has no usable peers", () => {
    const options = selectChallengeOptions({
      id: "summit-series-1972",
      subject: "Canada vs Soviet Union (1972)",
      year: 1972,
      category: "Olympic Hockey",
      sport: "ice_hockey",
    });

    expect(options).toHaveLength(4);
    expect(options.filter((option) => option !== "1972 Olympic Hockey: Canada vs Soviet Union")).toHaveLength(3);
    expect(options.join(" ")).not.toMatch(/1896|-776/);
    expect(options.every((option) => /Olympic Hockey: .+ vs .+/.test(option))).toBe(true);
    expect(
      optionMatchesChallenge("1972 Olympic Hockey: Canada vs Soviet Union", {
        subject: "Canada vs Soviet Union (1972)",
        year: 1972,
        category: "Olympic Hockey",
        sport: "ice_hockey",
      }),
    ).toBe(true);
    expect(
      optionMatchesChallenge(options.find((option) => !option.startsWith("1972")) ?? "", {
        subject: "Canada vs Soviet Union (1972)",
        year: 1972,
        category: "Olympic Hockey",
        sport: "ice_hockey",
      }),
    ).toBe(false);
  });

  it("keeps a 1930 final away from ancient games when peers are the wrong era", () => {
    const options = selectChallengeOptions({
      subject: "Uruguay vs Argentina",
      year: 1930,
      category: "World Cup",
      sport: "football",
      peers: [
        { subject: "Spyridon Louis wins the marathon", year: 1896, category: "Olympics", sport: "athletics" },
        { subject: "The first recorded Games", year: -776, category: "Ancient Olympics", sport: "olympics" },
      ],
    });

    expect(options).toHaveLength(4);
    expect(options.join(" ")).not.toMatch(/1896|-776|marathon/);
    expect(options.every((option) => /World Cup: .+ vs .+/.test(option))).toBe(true);
  });

  it("fills a curated list that repeats the correct fixture", () => {
    const options = selectChallengeOptions(
      {
        subject: "Canada vs Soviet Union (1972)",
        year: 1972,
        category: "Olympic Hockey",
        sport: "ice_hockey",
        decoys: ["Canada vs Soviet Union (1972)", "Canada vs Soviet Union", "USA vs Finland (1976)"],
      },
      () => 0.2,
    );

    expect(options).toHaveLength(4);
    expect(new Set(options.map((option) => option.toLowerCase())).size).toBe(4);
    expect(options).toContain("1976 Olympic Hockey: USA vs Finland");
    expect(options.join(" ")).not.toMatch(/1896|-776/);
  });
});
