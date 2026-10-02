import { getPuzzle } from "@/lib/catalog";
import { recapForId, type HistoricalRecap } from "@/lib/recaps";
import type { Puzzle } from "@/lib/types";

export const dynamic = "force-dynamic";

const CHALLENGE_ID = /^[a-z0-9-]{1,80}$/i;

export async function GET(request: Request) {
  const challengeId = new URL(request.url).searchParams.get("challengeId")?.trim() ?? "";
  if (!CHALLENGE_ID.test(challengeId)) {
    return Response.json({ error: "Invalid challenge" }, { status: 400 });
  }

  const recap = recapForId(challengeId) ?? recapFromPuzzle(getPuzzle(challengeId)) ?? genericRecap();
  return Response.json(recap);
}

function recapFromPuzzle(puzzle: Puzzle | undefined): HistoricalRecap | null {
  if (!puzzle) return null;
  const stats = puzzle.clues.flatMap((clue) => clue.stats ?? []);
  const venue = statValue(stats, ["Venue", "Host city", "Host / opponent", "Host"]);
  const finalScore = statValue(stats, ["Final score", "Final", "Score"]);
  const story = [
    puzzle.summary,
    puzzle.teaser,
    `${puzzle.year} is the year the archive files this ${puzzle.sport.replace(/-/g, " ")} case.`,
    "The clues were guarding the building, the score, and the play that decided who left with the moment.",
  ]
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");

  return {
    story,
    year: puzzle.year,
    venue,
    finalScore,
    decisivePlay: puzzle.summary,
    videoUrl: null,
  };
}

function statValue(stats: { label: string; value: string }[], labels: string[]): string | null {
  const wanted = new Set(labels.map((label) => label.toLowerCase()));
  return stats.find((stat) => wanted.has(stat.label.toLowerCase()))?.value ?? null;
}

function genericRecap(): HistoricalRecap {
  return {
    story:
      "The case closes on a fixture that outgrew the afternoon it was played. The clues narrowed the year, the building, and the people who would not let the moment stay ordinary. What looked like one result was the turn of a rivalry. The archive keeps the decisive play beside the score.",
    year: null,
    venue: null,
    finalScore: null,
    decisivePlay: null,
    videoUrl: null,
  };
}
