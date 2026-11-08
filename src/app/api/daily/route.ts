import { isGuestOpenDrop } from "@/lib/drop-dates";
import {
  fourDistinctOptions,
  loadDatedPublicDrop,
  loadMatchFixture,
  parseDateKey,
  toPublicDaily,
  viewerCanOpenArchive,
} from "@/lib/daily-drop";
import type { ClueLanguage } from "@/lib/tactical-clues";

export const dynamic = "force-dynamic";

function parseLanguage(value: string | null): ClueLanguage {
  return value === "en" ? "en" : "sv";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const language = parseLanguage(url.searchParams.get("lang"));
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

  if (!isGuestOpenDrop(dateKey) && !(await viewerCanOpenArchive())) {
    return Response.json({ error: "Sign in to open past drops." }, { status: 401 });
  }

  const fixture = await loadDatedPublicDrop(dateKey, language);
  if (!fixture) {
    return Response.json({ error: "That drop could not be loaded." }, { status: 404 });
  }
  const rawOptions = Array.from(new Set(fixture.options.filter(Boolean)));
  return Response.json({
    ...fixture,
    options: fourDistinctOptions(rawOptions, rawOptions[0] ?? "", rawOptions.slice(1)),
  });
}
