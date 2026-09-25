import { gradeOption, loadDailyFixture, parseDateKey } from "@/lib/daily-drop";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { id?: unknown; date_key?: unknown; option?: unknown; reveal?: unknown };
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

  const fixture = await loadDailyFixture(dateKey);
  if (typeof body.id === "string" && body.id !== fixture.id) {
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
