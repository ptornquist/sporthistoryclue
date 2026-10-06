import { swedishSurface } from "@/lib/swedish-surface";

export interface DecoyPeer {
  subject: string;
  year: number;
  category?: string | null;
  sport?: string | null;
}

export interface DecoyChallenge {
  id?: string | null;
  subject: string;
  year: number;
  category: string;
  sport?: string | null;
  decoys?: readonly string[] | null;
  peers?: readonly DecoyPeer[] | null;
}

const UNIFORM = /^(-?\d{1,4})\s+([^:]+):\s+(.+)$/;

const RIVALS: Record<string, Array<[string, string]>> = {
  ice_hockey: [
    ["USA", "Sovjetunionen"],
    ["Kanada", "Tjeckoslovakien"],
    ["Sverige", "Finland"],
    ["Kanada", "USA"],
    ["Sovjetunionen", "Tjeckoslovakien"],
  ],
  football: [
    ["Brasilien", "Italien"],
    ["Västtyskland", "Nederländerna"],
    ["Argentina", "England"],
    ["Frankrike", "Brasilien"],
    ["Uruguay", "Argentina"],
  ],
  boxing: [
    ["Muhammad Ali", "Joe Frazier"],
    ["George Foreman", "Ken Norton"],
    ["Joe Frazier", "George Foreman"],
  ],
  tennis: [
    ["Björn Borg", "Jimmy Connors"],
    ["Chris Evert", "Martina Navratilova"],
    ["John McEnroe", "Ivan Lendl"],
  ],
  basketball: [
    ["USA", "Sovjetunionen"],
    ["USA", "Jugoslavien"],
    ["USA", "Spanien"],
  ],
  athletics: [
    ["Favoriten", "den regerande mästaren"],
    ["Rekordhållaren", "utmanaren i bana fyra"],
    ["Hemmanationens löpare", "den olympiska mästaren"],
  ],
  gymnastics: [
    ["Den regerande mästaren", "hemmafavoriten"],
    ["Det sovjetiska bidraget", "det rumänska bidraget"],
    ["Ledaren i mångkampen", "hoppspecialisten"],
  ],
};

export function canonicalSport(value: string | null | undefined): string {
  const text = (value ?? "").toLowerCase().replace(/[_-]+/g, " ");
  if (text.includes("hockey")) return "ice_hockey";
  if (text.includes("football") || text.includes("soccer")) return "football";
  if (text.includes("box")) return "boxing";
  if (text.includes("tennis")) return "tennis";
  if (text.includes("basket")) return "basketball";
  if (text.includes("gymnast")) return "gymnastics";
  if (text.includes("athletic") || text.includes("track")) return "athletics";
  if (text.includes("rugby")) return "rugby";
  return text.trim();
}

export function isUnrelatedEra(fixtureYear: number, decoyYear: number): boolean {
  if (!Number.isFinite(decoyYear) || decoyYear === 0) return true;
  if (fixtureYear >= 1900 && decoyYear < 1900) return true;
  return false;
}

export function sportSearchTokens(sport: string): string[] {
  switch (canonicalSport(sport)) {
    case "ice_hockey":
      return ["hockey"];
    case "football":
      return ["football", "soccer"];
    case "boxing":
      return ["boxing"];
    case "tennis":
      return ["tennis"];
    case "basketball":
      return ["basketball"];
    case "athletics":
      return ["athletic", "track"];
    case "gymnastics":
      return ["gymnast"];
    case "rugby":
      return ["rugby"];
    default: {
      const token = canonicalSport(sport).replace(/_/g, " ").trim();
      return token ? [token] : [];
    }
  }
}

export function fisherYates<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

export function shortEvent(category: string, sport: string): string {
  if (/olympic/i.test(category) && sport === "ice_hockey") return "OS-hockey";
  if (/olympic/i.test(category) && sport === "basketball") return "OS-basket";
  if (/wimbledon/i.test(category)) return "Wimbledon";
  if (/world cup|vm\b/i.test(category)) return "VM";
  if (/summit/i.test(category)) return "Summitserien";
  if (/heavyweight|tungvikt/i.test(category)) return "Tungviktstitel";
  const cleaned = category.replace(/\b(decider|showdown|avgörande)\b/gi, "").replace(/\s+/g, " ").trim();
  return swedishSurface(cleaned || sportLabel(sport));
}

const KNOWN_MATCHUPS: Record<string, string> = {
  "the miracle on ice": "USA mot Sovjetunionen",
  "the dream team wins olympic gold in barcelona": "USA mot Kroatien",
  "uruguay win the first fifa world cup": "Uruguay mot Argentina",
  "west germany's miracle of bern": "Västtyskland mot Ungern",
  "a 17-year-old pelé wins the world cup in sweden": "Brasilien mot Sverige",
  "geoff hurst's hat-trick at wembley": "England mot Västtyskland",
  "maradona's goal of the century": "Argentina mot England",
  "manchester united's stoppage-time treble": "Manchester United mot Bayern München",
  "brandi chastain's penalty wins the women's world cup": "USA mot Kina",
  "messi wins the world cup in lusail": "Argentina mot Frankrike",
  "south africa win the rugby world cup in a springbok jersey": "Sydafrika mot Nya Zeeland",
  "billie jean king wins the battle of the sexes": "Billie Jean King mot Bobby Riggs",
  "spyridon louis wins the first olympic marathon": "Spyridon Louis vinner det första maratonloppet",
  "jesse owens wins four golds in berlin": "Jesse Owens fyra guld i Berlin",
  "dick fosbury flops to olympic gold": "Dick Fosbury och ryggfloppen",
  "nadia comăneci scores the first perfect 10": "Nadia Comăneci och den första tian",
  "nadia comaneci scores the first perfect 10": "Nadia Comăneci och den första tian",
  "usain bolt runs 9.69 in beijing": "Usain Bolt på 100 meter i Peking",
  "london 2012 super saturday": "Superlördagen i London",
  "leicester city win the premier league at 5000-1": "Leicester City blir mästare",
  "ali defeats foreman in the rumble in the jungle": "Ali mot Foreman",
};

export function matchupDetail(subject: string): string {
  const bare = subject.replace(/\s*\((-?\d{1,4})\)\s*$/, "").trim();
  if (/\bvs\.?\b/i.test(bare)) return bare;
  const known = KNOWN_MATCHUPS[bare.toLowerCase()];
  if (known) return known;
  const defeats = bare.match(/^(.+?)\s+defeats\s+(.+?)(?:\s+in\b.*)?$/i);
  if (defeats) return `${defeats[1].trim()} vs ${defeats[2].trim()}`;
  return bare;
}

export function swedishAnswer(subject: string): string {
  return swedishSurface(matchupDetail(subject));
}

export function formatOption(year: number, event: string, detail: string): string {
  const matchup = matchupDetail(detail);
  return swedishSurface(`${year} ${event}: ${matchup}`);
}

export function correctOptionLabel(source: Pick<DecoyChallenge, "subject" | "year" | "category" | "sport">): string {
  const sport = canonicalSport(source.sport) || canonicalSport(source.category);
  return formatOption(source.year, shortEvent(source.category, sport), source.subject);
}

export function optionMatchesChallenge(
  option: string,
  source: Pick<DecoyChallenge, "subject" | "year" | "category" | "sport">,
): boolean {
  const guess = option.trim().toLowerCase();
  const subject = source.subject.trim().toLowerCase();
  if (!guess || !subject) return false;
  if (guess === correctOptionLabel(source).toLowerCase()) return true;
  if (guess === subject) return true;
  if (guess === `${subject} (${source.year})`) return true;
  const bare = subject.replace(/\s*\((-?\d{1,4})\)\s*$/, "").trim();
  return bare.length > 0 && guess.includes(bare) && guess.includes(String(source.year));
}

export function selectChallengeOptions(
  source: DecoyChallenge,
  random: () => number = Math.random,
): string[] {
  const sport = canonicalSport(source.sport) || canonicalSport(source.category);
  const event = shortEvent(source.category, sport);
  const correct = correctOptionLabel({ ...source, sport });
  const curated = (source.decoys ?? []).map((item) => item.trim()).filter(Boolean);
  const formattedCurated = curated.map((item) => uniformDecoy(item, source.year, event));
  const pool = curated.length >= 3 ? formattedCurated : fallbackDecoys(source, sport, event, correct);

  const unique = [correct];
  const push = (option: string) => {
    if (unique.length >= 4) return;
    if (option.toLowerCase() === correct.toLowerCase()) return;
    if (unique.some((item) => item.toLowerCase() === option.toLowerCase())) return;
    unique.push(option);
  };
  for (const option of pool) push(option);
  if (unique.length < 4) {
    for (const option of fallbackDecoys(source, sport, event, correct)) push(option);
  }
  return fisherYates(unique, random);
}

function uniformDecoy(raw: string, fallbackYear: number, event: string): string {
  const uniform = raw.match(UNIFORM);
  if (uniform) return swedishSurface(`${uniform[1]} ${uniform[2].trim()}: ${uniform[3].trim()}`);
  const paren = raw.match(/^(.*)\((-?\d{1,4})\)\s*$/);
  if (paren) return formatOption(Number(paren[2]), event, paren[1]);
  const leading = raw.match(/^(-?\d{1,4})\s+(.+)$/);
  if (leading) return formatOption(Number(leading[1]), event, leading[2]);
  return formatOption(fallbackYear, event, raw);
}

function fallbackDecoys(
  source: DecoyChallenge,
  sport: string,
  event: string,
  correct: string,
): string[] {
  const fromPeers = (source.peers ?? [])
    .filter((peer) => canonicalSport(peer.sport || peer.category) === sport)
    .filter((peer) => !isUnrelatedEra(source.year, peer.year))
    .filter((peer) => peer.subject.trim().toLowerCase() !== source.subject.trim().toLowerCase())
    .map((peer) =>
      formatOption(
        peer.year,
        shortEvent(peer.category || source.category, sport),
        peer.subject,
      ),
    );

  const synthetic = syntheticDecoys(sport, source.year, event, source.subject);
  const pool = [...fromPeers, ...synthetic];
  const picked: string[] = [];
  for (const option of pool) {
    if (picked.length >= 3) break;
    if (option.toLowerCase() === correct.toLowerCase()) continue;
    if (picked.some((item) => item.toLowerCase() === option.toLowerCase())) continue;
    const year = Number(option.match(/^-?\d+/)?.[0]);
    if (isUnrelatedEra(source.year, year)) continue;
    picked.push(option);
  }
  return picked;
}

function syntheticDecoys(sport: string, year: number, event: string, subject: string): string[] {
  const pairs = RIVALS[sport] ?? [
    ["Hemmalaget", "bortalaget"],
    ["Regerande mästare", "utmanarna"],
    ["Favoriterna", "utmanarna"],
  ];
  const blocked = new Set([
    subject.replace(/\s*\((-?\d{1,4})\)\s*$/, "").trim().toLowerCase(),
    matchupDetail(subject).toLowerCase(),
  ]);
  const shifts = [-4, 4, 8, -8, 12, -12];
  const results: string[] = [];
  for (let index = 0; index < shifts.length && results.length < 3; index += 1) {
    const decoyYear = year + shifts[index];
    if (isUnrelatedEra(year, decoyYear)) continue;
    const pair = pairs[index % pairs.length];
    const detail = `${pair[0]} vs ${pair[1]}`;
    if (blocked.has(detail.toLowerCase())) continue;
    const label = formatOption(decoyYear, event, detail);
    if (!results.some((item) => item.toLowerCase() === label.toLowerCase())) results.push(label);
  }
  return results;
}

function sportLabel(sport: string): string {
  switch (sport) {
    case "ice_hockey":
      return "Ishockey";
    case "football":
      return "Fotboll";
    case "boxing":
      return "Boxning";
    case "tennis":
      return "Tennis";
    case "basketball":
      return "Basket";
    case "athletics":
      return "Friidrott";
    case "gymnastics":
      return "Gymnastik";
    default:
      return "Match";
  }
}
