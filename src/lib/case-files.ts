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
    title: "Det frusna miraklet",
    year: 1980,
    context: "OS-medaljomgång",
    sport: "ice_hockey",
  },
  {
    slug: "summit-series-1972",
    ids: ["summit-series-1972"],
    title: "Den åttonde sirenen",
    year: 1972,
    context: "Summit Series-avgörandet",
    sport: "ice_hockey",
  },
  {
    slug: "comaneci-1976",
    ids: ["comaneci-1976"],
    title: "1,00-poängsanomalin",
    year: 1976,
    context: "OS-mångkamp",
    sport: "gymnastics",
  },
  {
    slug: "dream-team-1992",
    ids: ["dream-team-1992"],
    title: "Uppvisningen i Barcelona",
    year: 1992,
    context: "OS-final",
    sport: "basketball",
  },
  {
    slug: "bolt-beijing-2008",
    ids: ["bolt-beijing-2008", "bolt-2008"],
    title: "Guldspikarna",
    year: 2008,
    context: "OS-final 100 meter",
    sport: "athletics",
  },
  {
    slug: "pele-sweden-1958",
    ids: ["pele-sweden-1958", "pele-1958"],
    title: "Genombrottet i Solna",
    year: 1958,
    context: "VM-final",
    sport: "football",
  },
  {
    slug: "hand-of-god-1986",
    ids: ["hand-of-god-1986", "maradona-1986"],
    title: "Dubbeln på Azteca",
    year: 1986,
    context: "VM-kvartsfinal",
    sport: "football",
  },
  {
    slug: "rumble-in-the-jungle-1974",
    ids: ["rumble-in-the-jungle-1974", "ali-1974"],
    title: "Natten i Kinshasa",
    year: 1974,
    context: "Titelmatch i tungvikt",
    sport: "boxing",
  },
  {
    slug: "wimbledon-epic-1980",
    ids: ["wimbledon-epic-1980"],
    title: "Tiebreaket som inte tog slut",
    year: 1980,
    context: "Wimbledonfinalen, herrar",
    sport: "tennis",
  },
  {
    slug: "pasadena-bronze-1994",
    ids: ["pasadena-bronze-1994"],
    title: "Bronshjältarna från Pasadena",
    year: 1994,
    context: "VM-bronsmatch",
    sport: "football",
  },
  {
    slug: "turin-gold-2006",
    ids: ["turin-gold-2006"],
    title: "Guldfeber i Turin",
    year: 2006,
    context: "OS-final",
    sport: "ice_hockey",
  },
];

export const SPORT_NAME: Record<CaseFile["sport"], string> = {
  ice_hockey: "Ice Hockey",
  football: "Football",
  boxing: "Boxing",
  tennis: "Tennis",
  athletics: "Athletics",
  gymnastics: "Gymnastics",
  basketball: "Basketball",
};

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

const TITLE_RENAMES: Record<string, string> = {
  "the beijing lightning bolt": "Guldspikarna",
  "the lake placid frequency": "Det frusna miraklet",
  "the masterpiece in hamilton": "Den 87:e symfonin",
  "the frozen miracle": "Det frusna miraklet",
  "the eighth siren": "Den åttonde sirenen",
  "the 1.00 scoreboard anomaly": "1,00-poängsanomalin",
  "the unmarked exhibition": "Uppvisningen i Barcelona",
  "the golden spikes": "Guldspikarna",
  "the solna breakthrough": "Genombrottet i Solna",
  "the azteca double": "Dubbeln på Azteca",
  "the kinshasa night": "Natten i Kinshasa",
  "the tiebreak that wouldn't end": "Tiebreaket som inte tog slut",
  "the centenario night": "Natten på Centenario",
  "the bern broadcast": "Radiosändningen från Bern",
  "the extra-time bar": "Ribban i förlängningen",
  "the stoppage night": "Natten på tilläggstid",
  "the rose bowl kick": "Straffen på Rose Bowl",
  "the unpriced title": "Den oprissatta titeln",
  "the gilded shootout": "Den förgyllda straffläggningen",
  "the houston exhibition": "Uppvisningen i Houston",
  "the berlin lanes": "Banorna i Berlin",
  "the backward bar": "Ribban baklänges",
  "the london night": "Natten i London",
};

export function publicCaseTitle(title: string | null | undefined): string {
  const value = title?.trim() ?? "";
  return TITLE_RENAMES[value.toLowerCase()] ?? value;
}

export function fixtureSubtitle(year: number, context: string): string {
  return `${year} · ${context} · 6 ledtrådar`;
}

export function isSpoilerHeading(title: string | undefined | null): boolean {
  const value = title?.trim() ?? "";
  if (!value) return true;
  if (/\bvs\.?\b/i.test(value)) return true;
  if (/\(\s*(18|19|20)\d{2}\s*\)/.test(value)) return true;
  if (/\b(scores|defeats|beats|wins|world record|perfect 10|hat-trick|hat trick)\b/i.test(value)) return true;
  if (/vinner|besegrar|slår|världsrekord|perfekt\w*\s*10|hattrick/i.test(value)) return true;
  if (/com[aă]neci|usain|\bbolt\b|pel[eé]|maradona|muhammad ali|foreman|mcenroe|\bborg\b|dream team|soviet|sweden|canada|croatia/i.test(value)) return true;
  return false;
}

export function safeHeading(title: string | undefined, year: number, id?: string): string {
  const file = findCase(id);
  if (file) return publicCaseTitle(file.title);
  const candidate = title?.trim();
  if (candidate && !isSpoilerHeading(candidate)) return publicCaseTitle(candidate);
  return `Arkivakt ${year}`;
}

export function safeContext(category: string | undefined, id?: string): string {
  const file = findCase(id);
  if (file) return file.context;
  const candidate = category?.trim();
  if (candidate && !isSpoilerHeading(candidate)) return candidate;
  return "Historisk match";
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
    title: publicCaseTitle(file.title),
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
