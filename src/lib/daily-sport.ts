import { hashString } from "@/lib/utils";

export const DAILY_SPORT_IDS = ["ice_hockey", "football", "boxing", "tennis", "athletics"] as const;

export type DailySportId = (typeof DAILY_SPORT_IDS)[number];

/** Playable fixtures for one sport. The same date always picks the same row. */
const SPORT_FIXTURES: Record<DailySportId, readonly string[]> = {
  ice_hockey: [
    "miracle-1980",
    "summit-series-1972",
    "sverige-sovjet-1984",
    "turin-gold-2006",
    "slaget-i-sudden",
    "guldkampen-i-norr",
  ],
  football: [
    "montevideo-1930",
    "bern-1954",
    "pele-1958",
    "hurst-1966",
    "maradona-1986",
    "pasadena-bronze-1994",
    "united-1999",
    "chastain-1999",
    "guldstriden-sista-omgangen",
    "sondagsmorgonen-stockholms-stad",
    "leicester-2016",
    "messi-2022",
  ],
  boxing: ["ali-1974"],
  tennis: ["king-1973", "wimbledon-epic-1980"],
  athletics: ["owens-1936", "fosbury-1968", "bolt-2008", "super-saturday-2012"],
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
  const pool = SPORT_FIXTURES[sport];
  return pool[hashString(`${dateKey}:${sport}`) % pool.length];
}
