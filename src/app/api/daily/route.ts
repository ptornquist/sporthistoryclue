import {
  fourDistinctOptions,
  loadDailyFixture,
  loadMatchFixture,
  parseDateKey,
  toPublicDaily,
  utcTodayKey,
  viewerCanOpenArchive,
} from "@/lib/daily-drop";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const match = url.searchParams.get("match")?.trim();
  if (match) {
    const storyline = await loadMatchFixture(match);
    if (!storyline) {
      return Response.json({ error: "That storyline match could not be opened." }, { status: 404 });
    }
    return Response.json(toPublicDaily(storyline));
  }

  const dateKey = parseDateKey(url.searchParams.get("date"));
  if (!dateKey) {
    return Response.json({ error: "Use a YYYY-MM-DD date." }, { status: 400 });
  }

  if (dateKey !== utcTodayKey() && !(await viewerCanOpenArchive())) {
    return Response.json({ error: "Sign in to open past drops." }, { status: 401 });
  }

  const fixture = await loadDailyFixture(dateKey);
  const payload = toPublicDaily(fixture);
  const rawOptions = Array.from(new Set(payload.options.filter(Boolean)));
  return Response.json({
    ...payload,
    options: fourDistinctOptions(rawOptions, rawOptions[0] ?? "", rawOptions.slice(1)),
  });
}
