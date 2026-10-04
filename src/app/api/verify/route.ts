import { findCase } from "@/lib/case-files";
import { isDailySportId } from "@/lib/daily-sport";
import { gradeOption, loadDailyFixture, loadMatchFixture, loadSportDaily, parseDateKey } from "@/lib/daily-drop";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { id?: unknown; date_key?: unknown; option?: unknown; reveal?: unknown; match?: unknown; sport?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid guess." }, { status: 400 });
  }

  const dateKey = parseDateKey(typeof body.date_key === "string" ? body.date_key : null);
  const option = typeof body.option === "string" ? body.option.trim() : "";
  if (!dateKey || !option) {
    return Response.json({ error: "A date and option are required." }, { status: 400 });
  }

  const match = typeof body.match === "string" ? body.match.trim() : "";
  const sport = typeof body.sport === "string" ? body.sport.trim() : "";
  const fixture = isDailySportId(sport)
    ? await loadSportDaily(sport, dateKey)
    : match
      ? await loadMatchFixture(match)
      : await loadDailyFixture(dateKey);
  if (!fixture) {
    return Response.json({ error: "That drop could not be verified." }, { status: 404 });
  }
  if (typeof body.id === "string" && body.id !== fixture.id && !sameCase(body.id, fixture.id)) {
    return Response.json({ error: "That drop could not be verified." }, { status: 404 });
  }

  const correct = gradeOption(fixture, option);
  if (!correct && body.reveal !== true) {
    return Response.json({ correct: false });
  }

  return Response.json({
    correct,
    subject: fixture.subject,
    year: fixture.year,
  });
}

function sameCase(left: string, right: string): boolean {
  const leftCase = findCase(left);
  const rightCase = findCase(right);
  return Boolean(leftCase && rightCase && leftCase.slug === rightCase.slug);
}
