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
    ["USA", "Soviet Union"],
    ["Canada", "Czechoslovakia"],
    ["Sweden", "Finland"],
    ["Canada", "USA"],
    ["Soviet Union", "Czechoslovakia"],
  ],
  football: [
    ["Brazil", "Italy"],
    ["West Germany", "Netherlands"],
    ["Argentina", "England"],
    ["France", "Brazil"],
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
    ["USA", "Soviet Union"],
    ["USA", "Yugoslavia"],
    ["USA", "Spain"],
  ],
  athletics: [
    ["The favorite", "the defending champion"],
    ["The record holder", "the lane-four challenger"],
    ["The host-nation runner", "the Olympic champion"],
  ],
  gymnastics: [
    ["The defending champion", "the home favorite"],
    ["The Soviet entry", "the Romanian entry"],
    ["The all-around leader", "the vault specialist"],
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
  if (/olympic/i.test(category) && sport === "ice_hockey") return "Olympic Hockey";
  if (/olympic/i.test(category) && sport === "basketball") return "Olympic Basketball";
  if (/wimbledon/i.test(category)) return "Wimbledon";
  if (/world cup/i.test(category)) return "World Cup";
  if (/summit/i.test(category)) return "Summit Series";
  if (/heavyweight/i.test(category)) return "Heavyweight Title Fight";
  const cleaned = category.replace(/\b(decider|showdown)\b/gi, "").replace(/\s+/g, " ").trim();
  return cleaned || sportLabel(sport);
}

const KNOWN_MATCHUPS: Record<string, string> = {
  "the miracle on ice": "USA vs Soviet Union",
  "the dream team wins olympic gold in barcelona": "USA vs Croatia",
  "uruguay win the first fifa world cup": "Uruguay vs Argentina",
  "west germany's miracle of bern": "West Germany vs Hungary",
  "a 17-year-old pelé wins the world cup in sweden": "Brazil vs Sweden",
  "geoff hurst's hat-trick at wembley": "England vs West Germany",
  "maradona's goal of the century": "Argentina vs England",
  "manchester united's stoppage-time treble": "Manchester United vs Bayern Munich",
  "brandi chastain's penalty wins the women's world cup": "USA vs China",
  "messi wins the world cup in lusail": "Argentina vs France",
  "south africa win the rugby world cup in a springbok jersey": "South Africa vs New Zealand",
  "billie jean king wins the battle of the sexes": "Billie Jean King vs Bobby Riggs",
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

export function formatOption(year: number, event: string, detail: string): string {
  const matchup = matchupDetail(detail);
  return `${year} ${event}: ${matchup}`;
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
  if (uniform) return `${uniform[1]} ${uniform[2].trim()}: ${uniform[3].trim()}`;
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
    ["The hosts", "the visitors"],
    ["The holders", "the challengers"],
    ["The favorites", "the underdogs"],
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
      return "Ice Hockey";
    case "football":
      return "Football";
    case "boxing":
      return "Boxing";
    case "tennis":
      return "Tennis";
    case "basketball":
      return "Basketball";
    case "athletics":
      return "Athletics";
    case "gymnastics":
      return "Gymnastics";
    default:
      return "Fixture";
  }
}
