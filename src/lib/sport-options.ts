import { findCase } from "@/lib/case-files";
import { canonicalSport, fisherYates } from "@/lib/decoy-options";
import { distinctOptionValues, formatOptionText, optionIdentity } from "@/lib/option-text";

/** SHL club matchups. Used as the whole option set for the hockey campaign. */
export const SHL_MATCHUPS = [
  "Växjö mot Frölunda (2015)",
  "Färjestad mot HV71 (2011)",
  "Brynäs mot Leksand (2016)",
  "Skellefteå mot Luleå (2013)",
] as const;

/** Allsvenskan club matchups. Used as the whole option set for the football campaign. */
export const ALLSVENSKAN_MATCHUPS = [
  "Hammarby mot Djurgården (2018)",
  "AIK mot Djurgården (2017)",
  "Malmö FF mot IFK Göteborg (2015)",
  "Elfsborg mot AIK (2006)",
  "IFK Göteborg mot Trelleborg (2007)",
] as const;

/** Four buttons for the 1972 Summit Series. The first string is the graded answer. */
export const SUMMIT_SERIES_1972_OPTIONS = [
  "Kanada mot Sovjetunionen (1972)",
  "Sverige mot Sovjetunionen (1977)",
  "Kanada mot USA (1980)",
  "Tjeckoslovakien mot Sovjetunionen (1976)",
] as const;

const PINNED_DAILY_OPTIONS: Record<string, readonly string[]> = {
  "summit-series-1972": SUMMIT_SERIES_1972_OPTIONS,
};

function recognizePinnedOptions(options: readonly string[]): readonly string[] | null {
  const incoming = distinctOptionValues([...options], 4);
  if (incoming.length < 4) return null;
  for (const set of Object.values(PINNED_DAILY_OPTIONS)) {
    const same =
      incoming.length === set.length &&
      incoming.every((option) => set.some((item) => optionIdentity(item) === optionIdentity(option)));
    if (same) return set;
  }
  return null;
}

const DOMESTIC_LEAGUE_OPTIONS: Record<string, readonly string[]> = {
  "slaget-i-sudden": SHL_MATCHUPS,
  "guldkampen-i-norr": SHL_MATCHUPS,
  "sondagsmorgonen-stockholms-stad": ALLSVENSKAN_MATCHUPS,
  "guldstriden-sista-omgangen": ALLSVENSKAN_MATCHUPS,
};

/** Swedish club buttons for a league campaign fixture. Null for every other match. */
export function domesticLeagueOptions(matchId: string | null | undefined): readonly string[] | null {
  if (!matchId) return null;
  const key = findCase(matchId)?.slug ?? matchId;
  return DOMESTIC_LEAGUE_OPTIONS[key] ?? null;
}

/**
 * Answer buttons for one sport. Strings are disjoint across sports so a
 * football quiz cannot surface a tennis, boxing, hockey, or athletics classic.
 */
export const SPORT_CHOICES: Record<string, readonly string[]> = {
  ice_hockey: [
    "USA mot Sovjetunionen (1980)",
    "Kanada mot Sovjetunionen (1972)",
    "Sverige mot Finland (2006)",
    "Sovjetunionen mot Tjeckoslovakien (1968)",
    "Kanada mot USA (1987)",
    "Miraklet på isen",
    ...SHL_MATCHUPS,
  ],
  football: [
    "Sverige mot Bulgarien (1994)",
    "Sverige mot Italien (2017)",
    "Argentina mot England (1986)",
    "Brasilien mot Italien (1970)",
    "Brasilien mot Sverige (1958)",
    "Västtyskland mot Ungern (1954)",
    "England mot Västtyskland (1966)",
    "Uruguay mot Argentina (1930)",
    "Argentina mot Frankrike (2022)",
    "Uruguay vinner det första VM-guldet",
    "Västtysklands mirakel i Bern",
    "En 17-årig Pelé vinner VM i Sverige",
    "Geoff Hursts hattrick på Wembley",
    "Maradonas århundradets mål",
    "Manchester Uniteds trippel på tilläggstid",
    "Brandi Chastains straff vinner damernas VM",
    "Leicester City vinner Premier League till 5000–1",
    "Messi vinner VM i Lusail",
    ...ALLSVENSKAN_MATCHUPS,
  ],
  boxing: [
    "Muhammad Ali mot George Foreman (1974)",
    "Muhammad Ali mot Joe Frazier (1975)",
    "Joe Frazier mot George Foreman (1973)",
    "Mike Tyson mot Buster Douglas (1990)",
    "Ali besegrar Foreman i Djungelns dån",
  ],
  tennis: [
    "Björn Borg mot John McEnroe (1980)",
    "Björn Borg mot Jimmy Connors (1977)",
    "John McEnroe mot Ivan Lendl (1984)",
    "Chris Evert mot Martina Navratilova (1984)",
    "Billie Jean King mot Bobby Riggs (1973)",
    "Billie Jean King vinner Kampen mellan könen",
  ],
  athletics: [
    "Usain Bolt (2008)",
    "Jesse Owens tar fyra guld i Berlin",
    "Dick Fosbury floppar sig till OS-guld",
    "Super Saturday i London 2012",
    "Carl Lewis tar fyra guld i Los Angeles (1984)",
    "Usain Bolt springer 9,69 i Peking",
  ],
  basketball: [
    "USA:s uppvisningslag mot Kroatien (1992)",
    "USA mot Jugoslavien (1976)",
    "USA mot Spanien (2008)",
    "USA mot Argentina (2004)",
    "Dream Team tar OS-guld i Barcelona",
  ],
  gymnastics: [
    "Nadia Comăneci (1976)",
    "Olga Korbut (1972)",
    "Larisa Latynina (1956)",
    "Simone Biles (2016)",
    "Nadia Comăneci sätter den första perfekta tian",
  ],
  rugby: [
    "Sydafrika mot Nya Zeeland (1995)",
    "England mot Australien (2003)",
    "Sydafrika mot England (2007)",
    "Sydafrika vinner rugby-VM i springboktröja",
  ],
  olympics: [
    "Spyridon Louis vinner det första olympiska maratonloppet",
    "De första moderna spelen i Aten (1896)",
    "Propagandaspelen i Berlin (1936)",
    "Spelen i Mexico City (1968)",
    "Spelen i Seoul (1988)",
  ],
};

export function choiceSportKey(sport: string | null | undefined): string {
  const key = canonicalSport(sport);
  if (key.includes("olympic")) return "olympics";
  return key;
}

export function choicesForSport(sport: string | null | undefined): string[] {
  return [...(SPORT_CHOICES[choiceSportKey(sport)] ?? [])];
}

export function optionSport(option: string): string | null {
  const key = optionIdentity(option);
  if (!key) return null;
  const hits = Object.entries(SPORT_CHOICES).filter(([, choices]) =>
    choices.some((choice) => sameMatchup(choice, option)),
  );
  return hits.length === 1 ? hits[0][0] : null;
}

const HOCKEY_FAMILY =
  /summit series|toppmötesserien|miraklet på isen|växjö|frölunda|skellefteå|luleå|färjestad|brynäs|leksand|\bhv71\b|ishockey|sovjetunionen|soviet union/i;
const FOOTBALL_FAMILY =
  /pelé|maradona|hurst|leicester|chastain|messi|hammarby|djurgården|malmö|ifk göteborg|trelleborg|elfsborg|allsvenskan|wembley|premier league|vm-final|italien/i;

/** Sport implied by a button that is not an exact pool string. */
export function familySport(option: string): string | null {
  const text = localizeMatchup(option);
  if (HOCKEY_FAMILY.test(text) || HOCKEY_FAMILY.test(option)) return "ice_hockey";
  if (FOOTBALL_FAMILY.test(text) || FOOTBALL_FAMILY.test(option)) return "football";
  return null;
}

/** Sport shared by the answer buttons, when they agree. */
export function inferOptionSport(options: readonly string[]): string | null {
  const counts = new Map<string, number>();
  for (const option of options) {
    const sport = optionSport(option) ?? familySport(option);
    if (!sport || !SPORT_CHOICES[sport]) continue;
    counts.set(sport, (counts.get(sport) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  let tied = false;
  for (const [sport, count] of counts) {
    if (count > bestCount) {
      best = sport;
      bestCount = count;
      tied = false;
    } else if (count === bestCount) {
      tied = true;
    }
  }
  if (!best || tied) return null;
  return best;
}

function conflictsWithSport(option: string, sport: string): boolean {
  if (!SPORT_CHOICES[sport]) return false;
  const known = optionSport(option) ?? familySport(option);
  return Boolean(known && known !== sport);
}

/** Keeps the correct sport's classics and refills until four choices exist. */
export function scopeOptionsToSport(options: readonly string[], sport: string): string[] {
  const key = choiceSportKey(sport);
  const kept = options.filter((option) => optionSport(option) === key);
  return distinctOptionValues([...kept, ...choicesForSport(key)], 4);
}

const TEAM_SPORTS = new Set(["ice_hockey", "football"]);

const DAILY_OPTION_FALLBACK = [
  "Sverige mot Finland (2006)",
  "Sverige mot Bulgarien (1994)",
  "Björn Borg mot John McEnroe (1980)",
  "Muhammad Ali mot George Foreman (1974)",
] as const;

const LOCALIZATIONS: Array<[RegExp, string]> = [
  [/\bvs\.?\b/gi, "mot"],
  [/\bdefeats\b/gi, "besegrar"],
  [/\bSoviet Union\b/gi, "Sovjetunionen"],
  [/\bWest Germany\b/gi, "Västtyskland"],
  [/\bSouth Africa\b/gi, "Sydafrika"],
  [/\bNew Zealand\b/gi, "Nya Zeeland"],
  [/\bCzechoslovakia\b/gi, "Tjeckoslovakien"],
  [/\bNetherlands\b/gi, "Nederländerna"],
  [/\bYugoslavia\b/gi, "Jugoslavien"],
  [/\bSweden\b/gi, "Sverige"],
  [/\bBulgaria\b/gi, "Bulgarien"],
  [/\bHungary\b/gi, "Ungern"],
  [/\bCanada\b/gi, "Kanada"],
  [/\bBrazil\b/gi, "Brasilien"],
  [/\bItaly\b/gi, "Italien"],
  [/\bFrance\b/gi, "Frankrike"],
  [/\bSpain\b/gi, "Spanien"],
  [/\bCroatia\b/gi, "Kroatien"],
  [/\bAustralia\b/gi, "Australien"],
  [/summit series/gi, "Toppmötesserien"],
];

/** A stored button such as "1999 football: Sweden vs Bulgaria". */
export function isRawEnglishOption(option: string): boolean {
  const text = option.trim();
  if (/^\d{3,4}\s+[A-Za-z][^:]{0,48}:\s+\S/.test(text)) return true;
  if (/\bvs\.?\b/i.test(text)) return true;
  if (/\bdefeats\b/i.test(text)) return true;
  return false;
}

export function localizeMatchup(option: string): string {
  let text = formatOptionText(option).replace(/^(?:18|19|20)\d{2}\s+[^:]{1,80}:\s*/, "");
  for (const [pattern, replacement] of LOCALIZATIONS) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/\s+/g, " ").trim();
}

function domesticPool(sport: string): readonly string[] {
  if (sport === "ice_hockey") return SHL_MATCHUPS;
  if (sport === "football") return ALLSVENSKAN_MATCHUPS;
  return [];
}

function sameMatchup(left: string, right: string): boolean {
  const a = optionIdentity(left);
  const b = optionIdentity(right);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length < 8 || b.length < 8) return false;
  return a.includes(b) || b.includes(a);
}

function swedishLabel(option: string, sport: string): string {
  const localized = localizeMatchup(option);
  if (!localized) return "";
  const pool = [...choicesForSport(sport), ...domesticPool(sport)];
  const hit = pool.find((choice) => sameMatchup(choice, localized));
  const base = hit ?? localized;
  const year = option.match(/\b(?:18|19|20)\d{2}\b/)?.[0];
  if (year && !base.includes(year)) return `${base} (${year})`;
  return base;
}

function belongsToSport(option: string, sport: string): boolean {
  if (!SPORT_CHOICES[sport]) return false;
  return choicesForSport(sport).some((choice) => sameMatchup(choice, option));
}

/** True when the button still names this fixture after Swedish wording is applied. */
export function gradesDailyOption(option: string, subject: string, year: number, sport = ""): boolean {
  const guess = option.trim().toLowerCase();
  const target = subject.trim().toLowerCase();
  if (!guess || !target) return false;
  if (guess === target) return true;
  if (guess === `${target} (${year})`) return true;
  if (guess.includes(target) && guess.includes(String(year))) return true;
  if (year < 1800) return false;
  const labeled = swedishLabel(`${subject} (${year})`, choiceSportKey(sport)).toLowerCase();
  if (labeled && guess === labeled) return true;
  const bare = labeled.replace(/\s*\((?:18|19|20)\d{2}\)\s*$/g, "").trim();
  return bare.length >= 12 && guess.includes(bare) && guess.includes(String(year));
}

function isDomesticLabel(option: string, sport: string): boolean {
  return domesticPool(sport).some((choice) => sameMatchup(choice, option));
}

/**
 * Four distinct daily buttons. Team sports stay on Swedish clubs when the
 * fixture is domestic, and on Swedish matchup wording for an international milestone.
 */
export function ensureFourDailyOptions(
  options: readonly string[] | null | undefined,
  sport: string,
  matchId?: string | null,
  random: () => number = Math.random,
): string[] {
  const campaign = domesticLeagueOptions(matchId);
  let key = choiceSportKey(sport);
  if (!SPORT_CHOICES[key]) {
    const inferred = inferOptionSport(options ?? []);
    if (inferred) key = inferred;
  }
  const localized = (options ?? [])
    .map((option) => swedishLabel(option, key))
    .filter((option) => option.length > 0 && !isRawEnglishOption(option));

  if (campaign) {
    const lead = localized.find((option) => campaign.some((item) => sameMatchup(item, option)));
    return fisherYates(distinctOptionValues([...(lead ? [lead] : []), ...campaign], 4), random);
  }

  const pinnedKey = findCase(matchId ?? "")?.slug ?? matchId ?? "";
  const pinned = PINNED_DAILY_OPTIONS[pinnedKey] ?? recognizePinnedOptions(options ?? []);
  if (pinned) {
    return fisherYates(distinctOptionValues([...pinned], 4), random);
  }

  const sportKnown = Boolean(SPORT_CHOICES[key]);
  const distinctReady = distinctOptionValues(localized, 4);
  const sameSport =
    distinctReady.length >= 4 &&
    sportKnown &&
    distinctReady.every((option) => !conflictsWithSport(option, key));
  if (sameSport) return fisherYates(distinctReady, random);

  const compatible = sportKnown ? localized.filter((option) => !conflictsWithSport(option, key)) : localized;
  const lead = compatible[0];
  const inSport = compatible.filter((option) => belongsToSport(option, key));
  const leadDomestic = Boolean(lead && isDomesticLabel(lead, key));
  const leadInternational = Boolean(lead && belongsToSport(lead, key) && !leadDomestic);
  const visible = leadDomestic
    ? inSport.filter((option) => isDomesticLabel(option, key))
    : leadInternational && lead
      ? [lead, ...inSport.filter((option) => !isDomesticLabel(option, key) && !sameMatchup(option, lead))]
      : lead && !conflictsWithSport(lead, key)
        ? [lead]
        : [];
  const domesticOnly = leadDomestic || (visible.length === 0 && TEAM_SPORTS.has(key));
  const international = choicesForSport(key).filter((option) => !isDomesticLabel(option, key));
  const fillers = domesticOnly
    ? [...domesticPool(key)]
    : international.length > 0
      ? [...international, ...domesticPool(key)]
      : choicesForSport(key).length > 0
        ? [...choicesForSport(key)]
        : [...DAILY_OPTION_FALLBACK];

  return fisherYates(distinctOptionValues([...visible, ...fillers], 4), random);
}
