export interface CaseFile {
  slug: string;
  ids: string[];
  title: string;
  year: number;
  context: string;
  sport:
    | "ice_hockey"
    | "football"
    | "boxing"
    | "tennis"
    | "athletics"
    | "gymnastics"
    | "basketball";
}

export interface FixturePreviewModel {
  key: string;
  lookupIds: string[];
  title: string;
  year: number;
  context: string;
}

/** Public case names only. Resolved matchups stay out of this module. */
export const CASE_FILES: CaseFile[] = [
  {
    slug: "miracle-on-ice-1980",
    ids: ["miracle-on-ice-1980", "miracle-1980"],
    title: "The Lake Placid Frequency",
    year: 1980,
    context: "Olympic Medal Round",
    sport: "ice_hockey",
  },
  {
    slug: "summit-series-1972",
    ids: ["summit-series-1972"],
    title: "The Eighth Siren",
    year: 1972,
    context: "Summit Series Decider",
    sport: "ice_hockey",
  },
  {
    slug: "comaneci-1976",
    ids: ["comaneci-1976"],
    title: "The 1.00 Scoreboard Anomaly",
    year: 1976,
    context: "Olympic All-Around",
    sport: "gymnastics",
  },
  {
    slug: "dream-team-1992",
    ids: ["dream-team-1992"],
    title: "The Unmarked Exhibition",
    year: 1992,
    context: "Olympic Gold-Medal Game",
    sport: "basketball",
  },
  {
    slug: "bolt-beijing-2008",
    ids: ["bolt-beijing-2008", "bolt-2008"],
    title: "The Beijing Lightning Bolt",
    year: 2008,
    context: "Olympic 100m Final",
    sport: "athletics",
  },
  {
    slug: "pele-sweden-1958",
    ids: ["pele-sweden-1958", "pele-1958"],
    title: "The Solna Breakthrough",
    year: 1958,
    context: "World Cup Final",
    sport: "football",
  },
  {
    slug: "hand-of-god-1986",
    ids: ["hand-of-god-1986", "maradona-1986"],
    title: "The Azteca Double",
    year: 1986,
    context: "World Cup Quarter-Final",
    sport: "football",
  },
  {
    slug: "rumble-in-the-jungle-1974",
    ids: ["rumble-in-the-jungle-1974", "ali-1974"],
    title: "The Kinshasa Night",
    year: 1974,
    context: "Heavyweight Title Fight",
    sport: "boxing",
  },
  {
    slug: "wimbledon-epic-1980",
    ids: ["wimbledon-epic-1980"],
    title: "The Tiebreak That Wouldn't End",
    year: 1980,
    context: "Wimbledon Gentlemen's Final",
    sport: "tennis",
  },
];

const SPORT_LABELS: Record<string, string[]> = {
  ice_hockey: ["ice hockey", "hockey"],
  football: ["football", "soccer"],
  boxing: ["boxing"],
  tennis: ["tennis"],
  athletics: ["athletics", "track and field", "track"],
  gymnastics: ["gymnastics"],
  basketball: ["basketball"],
};

export function findCase(id: string | undefined | null): CaseFile | undefined {
  if (!id) return undefined;
  return CASE_FILES.find((file) => file.ids.includes(id));
}

export function caseIdsFor(id: string): string[] {
  return findCase(id)?.ids ?? [id];
}

export function fixtureSubtitle(year: number, context: string): string {
  return `${year} · ${context} · 6 Clues`;
}

export function isSpoilerHeading(title: string | undefined | null): boolean {
  const value = title?.trim() ?? "";
  if (!value) return true;
  if (/\bvs\.?\b/i.test(value)) return true;
  if (/\(\s*(18|19|20)\d{2}\s*\)/.test(value)) return true;
  if (/\b(scores|defeats|beats|wins|world record|perfect 10|hat-trick|hat trick)\b/i.test(value)) return true;
  return false;
}

export function safeHeading(title: string | undefined, year: number, id?: string): string {
  const file = findCase(id);
  if (file) return file.title;
  const candidate = title?.trim();
  if (candidate && !isSpoilerHeading(candidate)) return candidate;
  return `Case File ${year}`;
}

export function safeContext(category: string | undefined, id?: string): string {
  const file = findCase(id);
  if (file) return file.context;
  const candidate = category?.trim();
  if (candidate && !isSpoilerHeading(candidate)) return candidate;
  return "Historic Fixture";
}

export function categoryMatchesSport(category: string | undefined, sport: string): boolean {
  if (!category) return false;
  const normalized = category
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const accepted = SPORT_LABELS[sport] ?? [sport.replace(/_/g, " ")];
  return accepted.some((label) => normalized === label || normalized.includes(label));
}

export function previewFromCase(file: CaseFile): FixturePreviewModel {
  return {
    key: file.slug,
    lookupIds: file.ids,
    title: file.title,
    year: file.year,
    context: file.context,
  };
}

export function previewFromArchive(row: {
  id: string;
  slug?: string | null;
  title?: string | null;
  category?: string | null;
  year: number;
}): FixturePreviewModel {
  const lookupIds = [row.slug, row.id].filter((value): value is string => Boolean(value));
  const file = lookupIds.map((id) => findCase(id)).find((match) => match != null);
  if (file) return previewFromCase(file);
  const id = row.slug || row.id;
  return {
    key: row.id,
    lookupIds,
    title: safeHeading(row.title ?? undefined, row.year, id),
    year: row.year,
    context: safeContext(row.category ?? undefined, id),
  };
}
