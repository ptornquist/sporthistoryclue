export const SWEDISH_CLUBS = [
  "AIK",
  "Djurgården",
  "Hammarby",
  "Leksand",
  "Färjestad",
  "Frölunda",
  "Brynäs",
  "Malmö FF",
  "IFK Göteborg",
  "AIK Fotboll",
  "IF Elfsborg",
  "MODO Hockey",
  "HV71",
  "Linköping HC",
] as const;

export type SwedishClub = (typeof SWEDISH_CLUBS)[number];

export interface ClubScoreRow {
  favorite_club: string | null;
  career_score: number | null;
}

export interface ClubChampionshipRow {
  club: SwedishClub;
  points: number;
  scouts: number;
}

const CLUB_SET = new Set<string>(SWEDISH_CLUBS);

export function isSwedishClub(value: string | null | undefined): value is SwedishClub {
  return Boolean(value && CLUB_SET.has(value));
}

/** Sums career points for each Swedish club and ranks Klubbligan. */
export function rankClubChampionship(rows: readonly ClubScoreRow[]): ClubChampionshipRow[] {
  const totals = new Map<SwedishClub, { points: number; scouts: number }>();
  for (const club of SWEDISH_CLUBS) totals.set(club, { points: 0, scouts: 0 });

  for (const row of rows) {
    if (!isSwedishClub(row.favorite_club)) continue;
    const bucket = totals.get(row.favorite_club);
    if (!bucket) continue;
    bucket.scouts += 1;
    const score = row.career_score ?? 0;
    if (Number.isFinite(score)) bucket.points += score;
  }

  return SWEDISH_CLUBS.map((club) => {
    const bucket = totals.get(club) ?? { points: 0, scouts: 0 };
    return { club, points: bucket.points, scouts: bucket.scouts };
  }).sort((left, right) => right.points - left.points || left.club.localeCompare(right.club, "sv"));
}
