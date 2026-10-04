/**
 * Authored classics. Day index picks one row so the daily never falls
 * through to the generic sport bank.
 * Order is stable: 2026-10-04 is day 20730, and that slot is Scandinavium 1984.
 */
export const SPORT_KLURING_POOL = [
  { id: "sverige-sovjet-1984", sport: "ice_hockey" },
  { id: "miracle-1980", sport: "ice_hockey" },
  { id: "summit-series-1972", sport: "ice_hockey" },
  { id: "pele-1958", sport: "football" },
  { id: "maradona-1986", sport: "football" },
  { id: "hurst-1966", sport: "football" },
  { id: "bern-1954", sport: "football" },
  { id: "messi-2022", sport: "football" },
  { id: "ali-1974", sport: "boxing" },
  { id: "wimbledon-epic-1980", sport: "tennis" },
  { id: "king-1973", sport: "tennis" },
  { id: "bolt-2008", sport: "athletics" },
  { id: "owens-1936", sport: "athletics" },
  { id: "duplantis-2026", sport: "athletics" },
  { id: "fosbury-1968", sport: "athletics" },
  { id: "tyson-holyfield-1996", sport: "boxing" },
  { id: "thrilla-manila-1975", sport: "boxing" },
  { id: "clay-liston-1964", sport: "boxing" },
  { id: "hagler-leonard-1987", sport: "boxing" },
  { id: "louis-schmeling-1938", sport: "boxing" },
  { id: "federer-nadal-2008", sport: "tennis" },
  { id: "borg-mcenroe-1981", sport: "tennis" },
  { id: "edberg-becker-1988", sport: "tennis" },
  { id: "wilander-1982", sport: "tennis" },
  { id: "saint-cyr-1956", sport: "equestrian" },
  { id: "tokyo-hopp-2021", sport: "equestrian" },
  { id: "dujardin-2012", sport: "equestrian" },
  { id: "handboll-vm-1999", sport: "handball" },
  { id: "handboll-em-1994", sport: "handball" },
  { id: "handboll-em-2022", sport: "handball" },
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
