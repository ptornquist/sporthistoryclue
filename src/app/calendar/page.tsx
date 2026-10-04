import Header from "@/components/Header";
import { DailyCalendar } from "@/components/game/DailyCalendar";
import { utcDateKey } from "@/lib/drop-dates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CalendarPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden bg-[#fafafa] px-4 py-8 text-zinc-900 sm:px-6 sm:py-10">
        <DailyCalendar todayKey={utcDateKey()} />
      </main>
    </>
  );
}
