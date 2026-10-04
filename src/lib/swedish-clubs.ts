export const HOCKEY_CLUBS = [
  "AIK Hockey",
  "Brynäs IF",
  "Djurgården Hockey",
  "Frölunda HC",
  "Färjestad BK",
  "HV71",
  "IF Björklöven",
  "Leksands IF",
  "Linköping HC",
  "Luleå Hockey",
  "Malmö Redhawks",
  "MODO Hockey",
  "Rögle BK",
  "Skellefteå AIK",
  "Timrå IK",
  "Växjö Lakers",
  "Örebro Hockey",
] as const;

export const FOOTBALL_CLUBS = [
  "AIK",
  "BK Häcken",
  "Degerfors IF",
  "Djurgårdens IF",
  "Gais",
  "Halmstads BK",
  "Hammarby IF",
  "IF Brommapojkarna",
  "IF Elfsborg",
  "IFK Göteborg",
  "IK Sirius",
  "Kalmar FF",
  "Malmö FF",
  "Mjällby AIF",
  "Västerås SK",
  "Örgryte IS",
] as const;

export type HockeyClub = (typeof HOCKEY_CLUBS)[number];
export type FootballClub = (typeof FOOTBALL_CLUBS)[number];

export interface ClubScoreRow {
  club: string | null;
  career_score: number | null;
}

export interface ClubChampionshipRow {
  club: string;
  points: number;
  scouts: number;
}

const HOCKEY_SET = new Set<string>(HOCKEY_CLUBS);
const FOOTBALL_SET = new Set<string>(FOOTBALL_CLUBS);

export function isHockeyClub(value: string | null | undefined): value is HockeyClub {
  return Boolean(value && HOCKEY_SET.has(value));
}

export function isFootballClub(value: string | null | undefined): value is FootballClub {
  return Boolean(value && FOOTBALL_SET.has(value));
}

/** Sums career points for one league and ranks every club, including zeros. */
export function rankLeague(clubs: readonly string[], rows: readonly ClubScoreRow[]): ClubChampionshipRow[] {
  const allowed = new Set(clubs);
  const totals = new Map<string, { points: number; scouts: number }>();
  for (const club of clubs) totals.set(club, { points: 0, scouts: 0 });

  for (const row of rows) {
    if (!row.club || !allowed.has(row.club)) continue;
    const bucket = totals.get(row.club);
    if (!bucket) continue;
    bucket.scouts += 1;
    const score = row.career_score ?? 0;
    if (Number.isFinite(score)) bucket.points += score;
  }

  return clubs
    .map((club) => {
      const bucket = totals.get(club) ?? { points: 0, scouts: 0 };
      return { club, points: bucket.points, scouts: bucket.scouts };
    })
    .sort((left, right) => right.points - left.points || left.club.localeCompare(right.club, "sv"));
}
