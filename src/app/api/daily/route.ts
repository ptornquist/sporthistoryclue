import { isGuestOpenDrop } from "@/lib/drop-dates";
import {
  loadDailyFixture,
  loadMatchFixture,
  parseDateKey,
  toPublicDaily,
  viewerCanOpenArchive,
} from "@/lib/daily-drop";
import { ensureFourDailyOptions } from "@/lib/sport-options";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const match = url.searchParams.get("match")?.trim();
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

  if (!isGuestOpenDrop(dateKey) && !(await viewerCanOpenArchive())) {
    return Response.json({ error: "Sign in to open past drops." }, { status: 401 });
  }

  const fixture = await loadDailyFixture(dateKey);
  const payload = toPublicDaily(fixture);
  return Response.json({
    ...payload,
    options: ensureFourDailyOptions(payload.options, payload.category, payload.id),
  });
}
