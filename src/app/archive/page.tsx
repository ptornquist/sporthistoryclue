import { ArchiveCalendar } from "@/components/archive/ArchiveCalendar";
import { utcTodayKey } from "@/lib/daily-drop";

export default function ArchivePage() {
  return <ArchiveCalendar todayKey={utcTodayKey()} />;
}
