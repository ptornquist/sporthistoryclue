import Link from "next/link";
import { isDateKey, shiftUtcDateKey, utcDateKey } from "@/lib/drop-dates";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ArchiveMonth({ now = new Date() }: { now?: Date }) {
  const today = utcDateKey(now);
  const yesterday = shiftUtcDateKey(today, -1);
  const [yearText, monthText] = today.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const monthLabel = new Date(Date.UTC(year, monthIndex, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: Array<string | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return `${yearText}-${monthText}-${day}`;
    }),
  ];

  return (
    <section className="mx-auto w-full max-w-lg">
      <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">{monthLabel}</h1>
      <p className="mt-1 text-sm text-zinc-500">Open a day from this month. Today and yesterday are live.</p>
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
          const upcoming = dateKey > today;
          const tone =
            dateKey === today
              ? "border-zinc-950 bg-zinc-900 text-white"
              : dateKey === yesterday
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-950";
          if (upcoming) {
            return (
              <span
                key={dateKey}
                className="flex h-10 items-center justify-center rounded-xl border border-zinc-100 text-xs font-bold text-zinc-300"
              >
                {dayNumber}
              </span>
            );
          }
          const href = dateKey === today ? "/" : `/?date=${dateKey}`;
          return (
            <Link
              key={dateKey}
              href={href}
              className={`flex h-10 items-center justify-center rounded-xl border text-xs font-bold ${tone}`}
            >
              {dayNumber}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
