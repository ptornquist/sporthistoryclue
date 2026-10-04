/**
 * Authored kluringar. Day index picks one row so the daily never falls
 * through to the generic sport bank.
 * Order is stable: 2026-10-04 is day 20730, and that slot is Scandinavium 1984.
 */
export const SPORT_KLURING_POOL = [
  { id: "montevideo-1930", sport: "football" },
  { id: "bern-1954", sport: "football" },
  { id: "pele-1958", sport: "football" },
  { id: "hurst-1966", sport: "football" },
  { id: "maradona-1986", sport: "football" },
  { id: "sverige-sovjet-1984", sport: "ice_hockey" },
  { id: "summit-series-1972", sport: "ice_hockey" },
  { id: "miracle-1980", sport: "ice_hockey" },
  { id: "turin-gold-2006", sport: "ice_hockey" },
  { id: "slaget-i-sudden", sport: "ice_hockey" },
  { id: "guldkampen-i-norr", sport: "ice_hockey" },
  { id: "pasadena-bronze-1994", sport: "football" },
  { id: "united-1999", sport: "football" },
  { id: "chastain-1999", sport: "football" },
  { id: "guldstriden-sista-omgangen", sport: "football" },
  { id: "sondagsmorgonen-stockholms-stad", sport: "football" },
  { id: "leicester-2016", sport: "football" },
  { id: "messi-2022", sport: "football" },
  { id: "ali-1974", sport: "boxing" },
  { id: "king-1973", sport: "tennis" },
  { id: "wimbledon-epic-1980", sport: "tennis" },
  { id: "owens-1936", sport: "athletics" },
  { id: "fosbury-1968", sport: "athletics" },
  { id: "bolt-2008", sport: "athletics" },
  { id: "super-saturday-2012", sport: "athletics" },
] as const;

export type PoolSport = (typeof SPORT_KLURING_POOL)[number]["sport"];
export type PoolKluring = (typeof SPORT_KLURING_POOL)[number];

/** Same number the arena prints as KLURING #n. 2026-10-04 is 20730. */
export function dayIndexFromKey(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return 0;
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function kluringIdsForSport(sport: PoolSport): string[] {
  return SPORT_KLURING_POOL.filter((item) => item.sport === sport).map((item) => item.id);
}

/** The kluring for a UTC date. A sport argument stays inside that sport's rows. */
export function kluringForDay(dateKey: string, sport?: PoolSport): PoolKluring {
  const pool = sport ? SPORT_KLURING_POOL.filter((item) => item.sport === sport) : SPORT_KLURING_POOL;
  const rows = pool.length > 0 ? pool : SPORT_KLURING_POOL;
  return rows[dayIndexFromKey(dateKey) % rows.length];
}
