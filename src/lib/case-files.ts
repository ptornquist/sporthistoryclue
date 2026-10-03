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
    title: "Sirenen i kylan",
    year: 1980,
    context: "Medaljomgång",
    sport: "ice_hockey",
  },
  {
    slug: "summit-series-1972",
    ids: ["summit-series-1972"],
    title: "Sirenen före midnatt",
    year: 1972,
    context: "Internationell serie",
    sport: "ice_hockey",
  },
  {
    slug: "comaneci-1976",
    ids: ["comaneci-1976"],
    title: "Siffran som inte fick plats",
    year: 1976,
    context: "Individuell final",
    sport: "gymnastics",
  },
  {
    slug: "dream-team-1992",
    ids: ["dream-team-1992"],
    title: "Kvällen under strålkastarna",
    year: 1992,
    context: "Lagfinal",
    sport: "basketball",
  },
  {
    slug: "bolt-beijing-2008",
    ids: ["bolt-beijing-2008", "bolt-2008"],
    title: "Spikarna före bandet",
    year: 2008,
    context: "Kort banfinal",
    sport: "athletics",
  },
  {
    slug: "pele-sweden-1958",
    ids: ["pele-sweden-1958", "pele-1958"],
    title: "Genombrottet på värdarnas plan",
    year: 1958,
    context: "Världsmästerskapet",
    sport: "football",
  },
  {
    slug: "hand-of-god-1986",
    ids: ["hand-of-god-1986", "maradona-1986"],
    title: "Två ögonblick på hög höjd",
    year: 1986,
    context: "Utslagsmatch",
    sport: "football",
  },
  {
    slug: "rumble-in-the-jungle-1974",
    ids: ["rumble-in-the-jungle-1974", "ali-1974"],
    title: "Natten före gryningen",
    year: 1974,
    context: "Titelmatch",
    sport: "boxing",
  },
  {
    slug: "wimbledon-epic-1980",
    ids: ["wimbledon-epic-1980"],
    title: "Setet som inte ville sluta",
    year: 1980,
    context: "Gräsfinal",
    sport: "tennis",
  },
  {
    slug: "pasadena-bronze-1994",
    ids: ["pasadena-bronze-1994"],
    title: "Sommarnatten i västern",
    year: 1994,
    context: "Världsmästerskapet",
    sport: "football",
  },
  {
    slug: "turin-gold-2006",
    ids: ["turin-gold-2006"],
    title: "Vintermorgonen i alperna",
    year: 2006,
    context: "Internationell mästerskapsfinal",
    sport: "ice_hockey",
  },
  {
    slug: "slaget-i-sudden",
    ids: ["slaget-i-sudden"],
    title: "Mysteriet på isen #1",
    year: 2015,
    context: "Slutspelsdrama",
    sport: "ice_hockey",
  },
  {
    slug: "guldkampen-i-norr",
    ids: ["guldkampen-i-norr"],
    title: "Mysteriet på isen #2",
    year: 2013,
    context: "Finalserie",
    sport: "ice_hockey",
  },
  {
    slug: "sondagsmorgonen-stockholms-stad",
    ids: ["sondagsmorgonen-stockholms-stad"],
    title: "Mysteriet på gräset #1",
    year: 2018,
    context: "Derbyklassiker",
    sport: "football",
  },
  {
    slug: "guldstriden-sista-omgangen",
    ids: ["guldstriden-sista-omgangen"],
    title: "Mysteriet på gräset #2",
    year: 2007,
    context: "Guldstrid",
    sport: "football",
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
  "the beijing lightning bolt": "Spikarna före bandet",
  "the lake placid frequency": "Sirenen i kylan",
  "the masterpiece in hamilton": "Den 87:e symfonin",
  "the frozen miracle": "Sirenen i kylan",
  "the eighth siren": "Sirenen före midnatt",
  "the 1.00 scoreboard anomaly": "Siffran som inte fick plats",
  "the unmarked exhibition": "Kvällen under strålkastarna",
  "the golden spikes": "Spikarna före bandet",
  "the solna breakthrough": "Genombrottet på värdarnas plan",
  "the azteca double": "Två ögonblick på hög höjd",
  "the kinshasa night": "Natten före gryningen",
  "the tiebreak that wouldn't end": "Setet som inte ville sluta",
  "det frusna miraklet": "Sirenen i kylan",
  "den åttonde sirenen": "Sirenen före midnatt",
  "1,00-poängsanomalin": "Siffran som inte fick plats",
  "uppvisningen i barcelona": "Kvällen under strålkastarna",
  "guldspikarna": "Spikarna före bandet",
  "genombrottet i solna": "Genombrottet på värdarnas plan",
  "dubbeln på azteca": "Två ögonblick på hög höjd",
  "natten i kinshasa": "Natten före gryningen",
  "tiebreaket som inte tog slut": "Setet som inte ville sluta",
  "bronshjältarna från pasadena": "Sommarnatten i västern",
  "guldfeber i turin": "Vintermorgonen i alperna",
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
  "slaget i sudden": "Mysteriet på isen #1",
  "guldkampen i norr": "Mysteriet på isen #2",
  "söndagsmorgonen på stockholms stad": "Mysteriet på gräset #1",
  "guldstriden i sista omgången": "Mysteriet på gräset #2",
};

export function publicCaseTitle(title: string | null | undefined): string {
  const value = title?.trim() ?? "";
  return TITLE_RENAMES[value.toLowerCase()] ?? value;
}

export function fixtureSubtitle(
  year: number,
  context: string,
  options?: { clueCount?: boolean; showYear?: boolean },
): string {
  const base = options?.showYear === false ? context : `${year} · ${context}`;
  if (options?.clueCount === false) return base;
  return `${base} · 6 ledtrådar`;
}

/** Sport-shaped stand-in shown on campaign cards until that fixture is solved. */
export function mysteryFixtureLabel(sport: CaseFile["sport"] | string | undefined | null): string {
  switch (sport) {
    case "ice_hockey":
      return "Klassisk ishockeymatch";
    case "football":
      return "Historisk fotbollsmatch";
    case "boxing":
      return "Historisk titelmatch";
    case "athletics":
    case "gymnastics":
      return "Historiskt mästerskapsögonblick";
    default:
      return "Historisk mästerskapsfinal";
  }
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
