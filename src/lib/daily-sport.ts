import { kluringForDay, kluringIdsForSport, type PoolSport } from "@/lib/sport-kluringar-pool";

export const DAILY_SPORT_IDS = [
  "ice_hockey",
  "football",
  "boxing",
  "tennis",
  "athletics",
  "equestrian",
  "handball",
] as const;

export type DailySportId = (typeof DAILY_SPORT_IDS)[number];

/** Playable fixtures for one sport, in the question-pool order. */
const SPORT_FIXTURES: Record<DailySportId, readonly string[]> = {
  ice_hockey: kluringIdsForSport("ice_hockey"),
  football: kluringIdsForSport("football"),
  boxing: kluringIdsForSport("boxing"),
  tennis: kluringIdsForSport("tennis"),
  athletics: kluringIdsForSport("athletics"),
  equestrian: kluringIdsForSport("equestrian"),
  handball: kluringIdsForSport("handball"),
};

const FIXTURE_ALIASES: Record<string, string> = {
  "miracle-on-ice-1980": "miracle-1980",
  "rumble-in-the-jungle-1974": "ali-1974",
  "pele-sweden-1958": "pele-1958",
  "bolt-beijing-2008": "bolt-2008",
  "hand-of-god-1986": "maradona-1986",
};

export function dailyFixtureSources(): string[] {
  return DAILY_SPORT_IDS.flatMap((sport) => [...SPORT_FIXTURES[sport]]);
}

/** Sport of a known daily fixture, including the longer case-file slug. */
export function sportForFixture(id: string): DailySportId | null {
  const key = FIXTURE_ALIASES[id] ?? id;
  for (const sport of DAILY_SPORT_IDS) {
    if (SPORT_FIXTURES[sport].includes(key)) return sport;
  }
  return null;
}

export function isDailySportId(value: string | null | undefined): value is DailySportId {
  return DAILY_SPORT_IDS.includes(value as DailySportId);
}

/** Browser and server identity for one sport on one date. Separate from the general daily. */
export function sportDailyKey(dateKey: string, sport: DailySportId): string {
  return `daily-${sport}-${dateKey}`;
}

/** Which archived fixture is that sport's kluring on this date. */
export function fixtureIdForSportDay(sport: DailySportId, dateKey: string): string {
  return kluringForDay(dateKey, sport as PoolSport).id;
}
