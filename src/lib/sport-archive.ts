export const ARCHIVE_SPORTS = [
  { id: "ice_hockey", name: "Ishockey", icon: "🏒" },
  { id: "football", name: "Fotboll", icon: "⚽" },
  { id: "boxing", name: "Boxning", icon: "🥊" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
  { id: "athletics", name: "Friidrott", icon: "🏃" },
] as const;

export type ArchiveSportId = (typeof ARCHIVE_SPORTS)[number]["id"];

export interface ArchiveSportFixture {
  id: string;
  sport: ArchiveSportId;
  title: string;
  year: number;
  context: string;
  difficulty: 1 | 2 | 3;
  clueCount: number;
}

/** Public case names only. Match ids open in the daily solver. */
export const ARCHIVE_FIXTURES: ArchiveSportFixture[] = [
  {
    id: "summit-series-1972",
    sport: "ice_hockey",
    title: "The Eighth Siren",
    year: 1972,
    context: "Summit Series Decider",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "miracle-on-ice-1980",
    sport: "ice_hockey",
    title: "The Frozen Miracle",
    year: 1980,
    context: "Olympic Medal Round",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "montevideo-1930",
    sport: "football",
    title: "The Centenario Night",
    year: 1930,
    context: "World Cup Final",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "bern-1954",
    sport: "football",
    title: "The Bern Broadcast",
    year: 1954,
    context: "World Cup Final",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "pele-sweden-1958",
    sport: "football",
    title: "The Solna Breakthrough",
    year: 1958,
    context: "World Cup Final",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "hurst-1966",
    sport: "football",
    title: "The Extra-Time Bar",
    year: 1966,
    context: "World Cup Final",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "hand-of-god-1986",
    sport: "football",
    title: "The Azteca Double",
    year: 1986,
    context: "World Cup Quarter-Final",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "united-1999",
    sport: "football",
    title: "The Stoppage Night",
    year: 1999,
    context: "European Cup Final",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "chastain-1999",
    sport: "football",
    title: "The Rose Bowl Kick",
    year: 1999,
    context: "World Cup Final",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "leicester-2016",
    sport: "football",
    title: "The Unpriced Title",
    year: 2016,
    context: "League Season",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "messi-2022",
    sport: "football",
    title: "The Gilded Shootout",
    year: 2022,
    context: "World Cup Final",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "rumble-in-the-jungle-1974",
    sport: "boxing",
    title: "The Kinshasa Night",
    year: 1974,
    context: "Heavyweight Title Fight",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "king-1973",
    sport: "tennis",
    title: "The Houston Exhibition",
    year: 1973,
    context: "Exhibition Match",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "wimbledon-epic-1980",
    sport: "tennis",
    title: "The Tiebreak That Wouldn't End",
    year: 1980,
    context: "Wimbledon Gentlemen's Final",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "owens-1936",
    sport: "athletics",
    title: "The Berlin Lanes",
    year: 1936,
    context: "Olympic Sprints",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "fosbury-1968",
    sport: "athletics",
    title: "The Backward Bar",
    year: 1968,
    context: "Olympic High Jump",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "bolt-beijing-2008",
    sport: "athletics",
    title: "The Golden Spikes",
    year: 2008,
    context: "Olympic 100m Final",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "super-saturday-2012",
    sport: "athletics",
    title: "The London Night",
    year: 2012,
    context: "Olympic Finals",
    difficulty: 2,
    clueCount: 5,
  },
];

export function archiveSportFromParam(value: string | undefined | null): ArchiveSportId {
  const match = ARCHIVE_SPORTS.find((sport) => sport.id === value);
  return match?.id ?? "ice_hockey";
}

export function loadArchiveIndex(sport: string | undefined | null = "ice_hockey"): ArchiveSportFixture[] {
  const selected = archiveSportFromParam(sport);
  return ARCHIVE_FIXTURES.filter((fixture) => fixture.sport === selected);
}

export function deduceHref(fixtureId: string): string {
  return `/?match=${encodeURIComponent(fixtureId)}`;
}
