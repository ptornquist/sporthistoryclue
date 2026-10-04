import { isDailySportId } from "@/lib/daily-sport";
import { isReleasedDrop } from "@/lib/drop-dates";
import {
  loadDailyFixture,
  loadMatchFixture,
  loadSportDaily,
  parseDateKey,
  toPublicDaily,
} from "@/lib/daily-drop";
import { alignDailyPresentation } from "@/lib/daily-presentation";
import { ensureFourDailyOptions } from "@/lib/sport-options";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const match = url.searchParams.get("match")?.trim();
  const sport = url.searchParams.get("sport")?.trim();
  if (!match && isDailySportId(sport)) {
    const dateKey = parseDateKey(url.searchParams.get("date"));
    if (!dateKey) {
      return Response.json({ error: "Use a YYYY-MM-DD date." }, { status: 400 });
    }
    if (!isReleasedDrop(dateKey)) {
      return Response.json({ error: "That drop has not opened yet." }, { status: 403 });
    }
    const fixture = await loadSportDaily(sport, dateKey);
    if (!fixture) {
      return Response.json({ error: "That sport has no daily kluring." }, { status: 404 });
    }
    const payload = toPublicDaily(fixture);
    const aligned = alignDailyPresentation({ ...payload, category: sport });
    return Response.json({
      ...payload,
      category: aligned.category,
      clues: aligned.clues,
      options: aligned.options,
    });
  }
  if (match) {
    const storyline = await loadMatchFixture(match);
    if (!storyline) {
      return Response.json({ error: "That storyline match could not be opened." }, { status: 404 });
    }
    const payload = toPublicDaily(storyline);
    return Response.json({
      ...payload,
      options: ensureFourDailyOptions(payload.options, payload.category, match),
    });
  }

  const dateKey = parseDateKey(url.searchParams.get("date"));
  if (!dateKey) {
    return Response.json({ error: "Use a YYYY-MM-DD date." }, { status: 400 });
  }

  if (!isReleasedDrop(dateKey)) {
    return Response.json({ error: "That drop has not opened yet." }, { status: 403 });
  }

  const fixture = await loadDailyFixture(dateKey);
  const payload = toPublicDaily(fixture);
  return Response.json({
    ...payload,
    options: ensureFourDailyOptions(payload.options, payload.category, payload.id),
  });
}
