import {
  fourDistinctOptions,
  isMatchKey,
  loadDailyFixture,
  loadPublicArchive,
  parseDateKey,
  toPublicDaily,
  utcTodayKey,
  viewerCanOpenArchive,
} from "@/lib/daily-drop";

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
    return Response.json(archive);
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
  const rawOptions = Array.from(new Set(payload.options.filter(Boolean)));
  return Response.json({
    ...payload,
    options: fourDistinctOptions(rawOptions, rawOptions[0] ?? "", rawOptions.slice(1)),
  });
}
