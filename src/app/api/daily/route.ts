import {
  loadDailyFixture,
  parseDateKey,
  toPublicDaily,
  utcTodayKey,
  viewerCanOpenArchive,
} from "@/lib/daily-drop";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const dateKey = parseDateKey(new URL(request.url).searchParams.get("date"));
  if (!dateKey) {
    return Response.json({ error: "Use a YYYY-MM-DD date." }, { status: 400 });
  }

  if (dateKey !== utcTodayKey() && !(await viewerCanOpenArchive())) {
    return Response.json({ error: "Sign in to open past drops." }, { status: 401 });
  }

  const fixture = await loadDailyFixture(dateKey);
  return Response.json(toPublicDaily(fixture));
}
