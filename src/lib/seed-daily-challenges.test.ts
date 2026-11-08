/**
 * Generates a SQL seed file that fills `challenges` with one Swedish puzzle
 * per day for a month, drawn from the local catalog. Run:
 *
 *   npx vitest run supabase/seed-daily-challenges.test.ts
 *
 * The SQL is written to supabase/seed-daily-challenges.sql. Paste it into the
 * Supabase SQL editor. Existing ids are skipped via ON CONFLICT DO NOTHING.
 */
import { writeFileSync } from "node:fs";
import { describe, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { puzzles } from "./catalog";
import { resolveTacticalClueList } from "./tactical-clues";

const MONTH = process.env.SEED_MONTH ?? "2026-11";

const SPORT_LABEL: Record<string, string> = {
  olympics: "Olympics",
  football: "Fotboll",
  ice_hockey: "Ishockey",
  boxing: "Boxning",
  tennis: "Tennis",
  athletics: "Friidrott",
  gymnastics: "Gymnastik",
  basketball: "Basket",
};

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function clueStrings(puzzle: (typeof puzzles)[number]): string[] {
  const list = resolveTacticalClueList(puzzle.clues).filter(Boolean);
  return list.length > 0 ? list : [puzzle.teaser];
}

const run = process.env.SEED_MONTH ? it : it.skip;

describe("seed daily challenges", () => {
  run("writes a SQL seed file for the month", () => {
    const [year, monthIndex] = MONTH.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();

    const statements: string[] = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = `${MONTH}-${String(day).padStart(2, "0")}`;
      const puzzle = puzzles[(day - 1) % puzzles.length];
      const rowId = `${puzzle.id}-${dateKey}`;
      const clues = clueStrings(puzzle);
      const options = [
        puzzle.title,
        ...puzzles
          .filter((p) => p.id !== puzzle.id)
          .slice(0, 3)
          .map((p) => p.title),
      ];
      const category = SPORT_LABEL[puzzle.sport] ?? puzzle.sport;

      statements.push(
        `insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)\n` +
          `values (\n` +
          `  '${escapeSql(rowId)}',\n` +
          `  '${dateKey}',\n` +
          `  '${dateKey}',\n` +
          `  '${escapeSql(puzzle.title)}',\n` +
          `  '${escapeSql(puzzle.title)}',\n` +
          `  ${puzzle.year},\n` +
          `  '${escapeSql(category)}',\n` +
          `  '${escapeSql(puzzle.sport)}',\n` +
          `  '${escapeSql(JSON.stringify(clues))}'::jsonb,\n` +
          `  '${escapeSql(JSON.stringify(options))}'::jsonb,\n` +
          `  now()\n` +
          `)\n` +
          `on conflict (id) do nothing;`,
      );
    }

    const sql =
      `-- Seed ${daysInMonth} daily challenges for ${MONTH}\n` +
      `-- Paste into the Supabase SQL editor. Existing ids are skipped.\n\n` +
      statements.join("\n\n") +
      "\n";

    writeFileSync(new URL("../../supabase/seed-daily-challenges.sql", import.meta.url), sql, "utf8");
    console.log(`Wrote ${daysInMonth} inserts to supabase/seed-daily-challenges.sql`);
  });
});
