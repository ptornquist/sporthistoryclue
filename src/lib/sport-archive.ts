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
    title: "Den åttonde sirenen",
    year: 1972,
    context: "Summit Series-avgörandet",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "miracle-on-ice-1980",
    sport: "ice_hockey",
    title: "Det frusna miraklet",
    year: 1980,
    context: "OS-medaljomgång",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "turin-gold-2006",
    sport: "ice_hockey",
    title: "Guldfeber i Turin",
    year: 2006,
    context: "OS-final",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "montevideo-1930",
    sport: "football",
    title: "Natten på Centenario",
    year: 1930,
    context: "VM-final",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "bern-1954",
    sport: "football",
    title: "Radiosändningen från Bern",
    year: 1954,
    context: "VM-final",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "pele-sweden-1958",
    sport: "football",
    title: "Genombrottet i Solna",
    year: 1958,
    context: "VM-final",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "hurst-1966",
    sport: "football",
    title: "Ribban i förlängningen",
    year: 1966,
    context: "VM-final",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "hand-of-god-1986",
    sport: "football",
    title: "Dubbeln på Azteca",
    year: 1986,
    context: "VM-kvartsfinal",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "pasadena-bronze-1994",
    sport: "football",
    title: "Bronshjältarna från Pasadena",
    year: 1994,
    context: "VM-bronsmatch",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "united-1999",
    sport: "football",
    title: "Natten på tilläggstid",
    year: 1999,
    context: "Europacupfinal",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "chastain-1999",
    sport: "football",
    title: "Straffen på Rose Bowl",
    year: 1999,
    context: "VM-final",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "leicester-2016",
    sport: "football",
    title: "Den oprissatta titeln",
    year: 2016,
    context: "Ligasejour",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "messi-2022",
    sport: "football",
    title: "Den förgyllda straffläggningen",
    year: 2022,
    context: "VM-final",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "rumble-in-the-jungle-1974",
    sport: "boxing",
    title: "Natten i Kinshasa",
    year: 1974,
    context: "Titelmatch i tungvikt",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "king-1973",
    sport: "tennis",
    title: "Uppvisningen i Houston",
    year: 1973,
    context: "Uppvisningsmatch",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "wimbledon-epic-1980",
    sport: "tennis",
    title: "Tiebreaket som inte tog slut",
    year: 1980,
    context: "Wimbledonfinalen, herrar",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "owens-1936",
    sport: "athletics",
    title: "Banorna i Berlin",
    year: 1936,
    context: "OS-sprint",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "fosbury-1968",
    sport: "athletics",
    title: "Ribban baklänges",
    year: 1968,
    context: "OS-höjdhopp",
    difficulty: 2,
    clueCount: 5,
  },
  {
    id: "bolt-beijing-2008",
    sport: "athletics",
    title: "Guldspikarna",
    year: 2008,
    context: "OS-final 100 meter",
    difficulty: 1,
    clueCount: 5,
  },
  {
    id: "super-saturday-2012",
    sport: "athletics",
    title: "Natten i London",
    year: 2012,
    context: "OS-finaler",
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
  return `/play/${encodeURIComponent(fixtureId)}`;
}
