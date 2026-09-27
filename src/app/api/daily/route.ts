import { arrangeClueLadder } from "@/lib/clue-ladder";
import {
  isMatchKey,
  loadDailyFixture,
  loadPublicArchive,
  parseDateKey,
  toPublicDaily,
  utcTodayKey,
} from "@/lib/daily-drop";
import { selectChallengeOptions } from "@/lib/decoy-options";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const matchParam = new URL(request.url).searchParams.get("match")?.trim() ?? "";
  if (matchParam) {
    if (!isMatchKey(matchParam)) {
      return Response.json({ error: "Unknown match." }, { status: 400 });
    }
    const archive = await loadPublicArchive(matchParam);
    if (!archive) {
      return Response.json({ error: "That archive match could not be found." }, { status: 404 });
    }
    const { optionSource, challenge, ...rest } = archive;
    return Response.json({
      ...rest,
      challenge: {
        ...challenge,
        options: challenge.optionsLocked ? challenge.options : selectChallengeOptions(optionSource),
        clues: challenge.optionsLocked
          ? challenge.clues
          : arrangeClueLadder(challenge.clues, { category: challenge.category }),
      },
    });
  }

  const dateKey = parseDateKey(new URL(request.url).searchParams.get("date"));
  if (!dateKey) {
    return Response.json({ error: "Use a YYYY-MM-DD date." }, { status: 400 });
  }

  if (dateKey > utcTodayKey()) {
    return Response.json({ error: "That drop has not been released." }, { status: 400 });
  }

  const fixture = await loadDailyFixture(dateKey);
  const payload = toPublicDaily(fixture);
  return Response.json({
    ...payload,
    options: fixture.optionsLocked
      ? payload.options
      : fixture.optionSource
        ? selectChallengeOptions(fixture.optionSource)
        : payload.options,
    clues: fixture.optionsLocked
      ? payload.clues
      : arrangeClueLadder(payload.clues, { category: payload.category }),
  });
}
