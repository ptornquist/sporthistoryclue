"use client";

import { useState } from "react";
import Link from "next/link";
import { isDateKey, shiftUtcDateKey } from "@/lib/drop-dates";

const WEEKDAYS = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];

function monthCells(year: number, monthIndex: number): Array<string | null> {
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const month = String(monthIndex + 1).padStart(2, "0");
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }),
  ];
}

export function DailyCalendar({ todayKey }: { todayKey: string }) {
  const [yearText, monthText] = todayKey.split("-");
  const todayYear = Number(yearText);
  const todayMonth = Number(monthText) - 1;
  const [cursor, setCursor] = useState({ year: todayYear, monthIndex: todayMonth });
  const yesterday = shiftUtcDateKey(todayKey, -1);
  const label = new Date(Date.UTC(cursor.year, cursor.monthIndex, 1)).toLocaleString("sv-SE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const atCurrentMonth = cursor.year === todayYear && cursor.monthIndex === todayMonth;
  const cells = monthCells(cursor.year, cursor.monthIndex);

  const shift = (delta: number) => {
    setCursor((current) => {
      const next = new Date(Date.UTC(current.year, current.monthIndex + delta, 1));
      return { year: next.getUTCFullYear(), monthIndex: next.getUTCMonth() };
    });
  };

  return (
    <section className="mx-auto w-full max-w-lg">
      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">Dagens Kluring</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">{label}</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-zinc-800 hover:border-zinc-950"
          >
            Föregående
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={atCurrentMonth}
            className="rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-zinc-800 hover:border-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-100 disabled:text-zinc-300"
          >
            Nästa
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-zinc-500">Välj en dag och spela den dagens kluring. Kommande datum är låsta.</p>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-wide text-zinc-400">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((dateKey, index) => {
          if (!isDateKey(dateKey)) {
            return <span key={`empty-${index}`} />;
          }
          const dayNumber = Number(dateKey.slice(-2));
          const upcoming = dateKey > todayKey;
          const tone =
            dateKey === todayKey
              ? "border-zinc-950 bg-zinc-900 text-white"
              : dateKey === yesterday
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-zinc-200 bg-white text-zinc-800 hover:border-blue-600 hover:text-blue-700";
          if (upcoming) {
            return (
              <span
                key={dateKey}
                className="flex h-12 items-center justify-center rounded-2xl border border-zinc-100 text-sm font-bold text-zinc-300"
              >
                {dayNumber}
              </span>
            );
          }
          const href = dateKey === todayKey ? "/" : `/?date=${dateKey}`;
          return (
            <Link
              key={dateKey}
              href={href}
              aria-label={`Spela kluringen ${dateKey}`}
              className={`flex h-12 items-center justify-center rounded-2xl border-2 text-sm font-black ${tone}`}
            >
              {dayNumber}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
