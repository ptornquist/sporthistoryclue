import { arrangeClueLadder } from "@/lib/clue-ladder";
import {
  isMatchKey,
  loadDailyFixture,
  loadPublicArchive,
  parseDateKey,
  toPublicDaily,
  utcTodayKey,
  viewerCanOpenArchive,
} from "@/lib/daily-drop";
import { selectChallengeOptions } from "@/lib/decoy-options";

export const dynamic = "force-dynamic";

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
        options: selectChallengeOptions(optionSource),
        clues: arrangeClueLadder(challenge.clues, { category: challenge.category }),
      },
    });
  }

  const dateKey = parseDateKey(new URL(request.url).searchParams.get("date"));
  if (!dateKey) {
    return Response.json({ error: "Use a YYYY-MM-DD date." }, { status: 400 });
  }

  if (dateKey !== utcTodayKey() && !(await viewerCanOpenArchive())) {
    return Response.json({ error: "Sign in to open past drops." }, { status: 401 });
  }

  const fixture = await loadDailyFixture(dateKey);
  const payload = toPublicDaily(fixture);
  return Response.json({
    ...payload,
    options: fixture.optionSource ? selectChallengeOptions(fixture.optionSource) : payload.options,
    clues: arrangeClueLadder(payload.clues, { category: payload.category }),
  });
}
