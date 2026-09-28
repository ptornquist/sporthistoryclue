import { describe, expect, it, vi } from "vitest";
import { FAVORITE_CLUB_KEY, findPremierLeagueClub } from "./premier-league";
import { SOLVED_HISTORY_KEY } from "./utc-streak";
import {
  STREAK_DATA_KEY,
  aggregateScoutStats,
  emptyStreak,
  nextStreakData,
  parseScoutHistory,
  readScoutDossier,
  recordScoutMatch,
  scoutRank,
} from "./scout-dossier";

const arsenal = findPremierLeagueClub("arsenal");

describe("scout dossier", () => {
  it("ranks solved matches", () => {
    expect(scoutRank(0)).toBe("Rookie Scout 🥉");
    expect(scoutRank(2)).toBe("Rookie Scout 🥉");
    expect(scoutRank(3)).toBe("Tactical Analyst 🥈");
    expect(scoutRank(6)).toBe("Master Historian 🥇");
    expect(scoutRank(11)).toBe("Chief of Intel 🎖️");
  });

  it("aggregates attempts, win rate, clues, tiles, and club points", () => {
    const stats = aggregateScoutStats(
      [
        { id: "a", date: "2026-09-01", sport: "football", score: 8000, tilesUnlocked: 1, won: true, timestamp: 1 },
        { id: "b", date: "2026-09-02", sport: "ice hockey", score: 4000, tilesUnlocked: 3, won: true, timestamp: 2 },
        { id: "c", date: "2026-09-03", sport: "boxing", score: 0, tilesUnlocked: 5, won: false, timestamp: 3 },
        { id: "d", date: "2026-09-04", sport: "tennis", score: 2000, tilesUnlocked: 2, won: true, timestamp: 4 },
        { id: "e", date: "2026-09-05", sport: "athletics", score: 1000, tilesUnlocked: 4, won: true, timestamp: 5 },
      ],
      { currentStreak: 2, maxStreak: 4, lastPlayedDate: "2026-09-05" },
      arsenal,
    );
    expect(stats.played).toBe(5);
    expect(stats.won).toBe(4);
    expect(stats.winRate).toBe(80);
    expect(stats.intelPoints).toBe(15000);
    expect(stats.averageClues).toBe(2.5);
    expect(stats.currentStreak).toBe(2);
    expect(stats.maxStreak).toBe(4);
    expect(stats.rank).toBe("Tactical Analyst 🥈");
    expect(stats.distribution.map((bucket) => bucket.count)).toEqual([1, 1, 1, 1, 0]);
    expect(stats.distribution.map((bucket) => bucket.label)).toEqual(["Arena", "Era", "Lineup", "Photo", "Climax"]);
    expect(stats.sports.map((sport) => [sport.label, sport.wins])).toEqual([
      ["Football", 1],
      ["Hockey", 1],
      ["Boxing", 0],
      ["Tennis", 1],
      ["Athletics", 1],
    ]);
    expect(stats.club?.name).toBe("Arsenal FC");
    expect(stats.clubPoints).toBe(15000);
  });

  it("keeps date streaks beside match objects and ignores them in the clue chart", () => {
    const matches = parseScoutHistory(
      JSON.stringify([
        "2026-09-01",
        { id: "miracle-1980", date: "2026-09-02", sport: "hockey", score: 5000, tilesUnlocked: 2, won: true, timestamp: 9 },
        "chapter-only",
      ]),
    );
    expect(matches).toHaveLength(2);
    expect(matches[1]).toMatchObject({ id: "2026-09-01", tilesUnlocked: 0, won: true });
    const stats = aggregateScoutStats(matches, emptyStreak(), null);
    expect(stats.played).toBe(2);
    expect(stats.averageClues).toBe(2);
    expect(stats.distribution[1]?.count).toBe(1);
    expect(stats.clubPoints).toBe(0);
    expect(stats.rank).toBe("Rookie Scout 🥉");
  });

  it("advances a win streak and resets it on a loss", () => {
    const start = emptyStreak();
    const first = nextStreakData(start, {
      id: "a",
      date: "2026-09-26",
      sport: "football",
      score: 1000,
      tilesUnlocked: 1,
      won: true,
      timestamp: 1,
    });
    const second = nextStreakData(first, {
      id: "b",
      date: "2026-09-27",
      sport: "football",
      score: 1000,
      tilesUnlocked: 1,
      won: true,
      timestamp: 2,
    });
    const sameDay = nextStreakData(second, {
      id: "c",
      date: "2026-09-27",
      sport: "tennis",
      score: 500,
      tilesUnlocked: 2,
      won: true,
      timestamp: 3,
    });
    const loss = nextStreakData(sameDay, {
      id: "d",
      date: "2026-09-28",
      sport: "boxing",
      score: 0,
      tilesUnlocked: 5,
      won: false,
      timestamp: 4,
    });
    expect(first.currentStreak).toBe(1);
    expect(second).toEqual({ currentStreak: 2, maxStreak: 2, lastPlayedDate: "2026-09-27" });
    expect(sameDay.currentStreak).toBe(2);
    expect(loss).toEqual({ currentStreak: 0, maxStreak: 2, lastPlayedDate: "2026-09-28" });
  });

  it("stores a match without dropping earlier date keys", () => {
    const store = new Map<string, string>([[SOLVED_HISTORY_KEY, JSON.stringify(["2026-09-01", "miracle-1980"])]]);
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
      },
    });
    recordScoutMatch({
      id: "ali-1974",
      date: "2026-09-02",
      sport: "boxing",
      score: 7500,
      tilesUnlocked: 2,
      won: true,
      timestamp: 10,
    });
    recordScoutMatch({
      id: "ali-1974",
      date: "2026-09-02",
      sport: "boxing",
      score: 7500,
      tilesUnlocked: 2,
      won: true,
      timestamp: 11,
    });
    const saved = JSON.parse(store.get(SOLVED_HISTORY_KEY) ?? "[]") as unknown[];
    expect(saved).toHaveLength(3);
    expect(saved[0]).toBe("2026-09-01");
    expect(saved[2]).toMatchObject({ id: "ali-1974", won: true });
    const streak = JSON.parse(store.get(STREAK_DATA_KEY) ?? "{}") as { currentStreak: number };
    expect(streak.currentStreak).toBe(1);
    store.set(FAVORITE_CLUB_KEY, "arsenal");
    const dossier = readScoutDossier(new Date("2026-09-02T12:00:00.000Z"));
    expect(dossier.played).toBe(2);
    expect(dossier.club?.id).toBe("arsenal");
    expect(dossier.clubPoints).toBe(7500);
    vi.unstubAllGlobals();
  });
});
