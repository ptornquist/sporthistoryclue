import { canonicalSport } from "@/lib/decoy-options";
import { distinctOptionValues, optionIdentity } from "@/lib/option-text";

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
  ],
  football: [
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
    choices.some((choice) => optionIdentity(choice) === key),
  );
  return hits.length === 1 ? hits[0][0] : null;
}

/** Keeps the correct sport's classics and refills until four choices exist. */
export function scopeOptionsToSport(options: readonly string[], sport: string): string[] {
  const key = choiceSportKey(sport);
  const kept = options.filter((option) => optionSport(option) === key);
  return distinctOptionValues([...kept, ...choicesForSport(key)], 4);
}
