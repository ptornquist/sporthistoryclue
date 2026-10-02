import Link from "next/link";
import { shiftUtcDateKey } from "@/lib/drop-dates";

interface DateSwitcherProps {
  todayKey: string;
  activeKey: string;
  onYesterday: () => void;
  onToday: () => void;
  onForward: () => void;
}

const pill =
  "rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-zinc-800 hover:border-zinc-950";

export function DateSwitcher({ todayKey, activeKey, onYesterday, onToday, onForward }: DateSwitcherProps) {
  const viewingYesterday = activeKey === shiftUtcDateKey(todayKey, -1);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={onYesterday} className={pill}>
        &lt; Yesterday
      </button>
      <button type="button" onClick={onToday} className={pill}>
        Today
      </button>
      {viewingYesterday && (
        <button type="button" onClick={onForward} className={pill} aria-label="Step forward to today">
          &gt;
        </button>
      )}
      <Link href="/archive" className={pill}>
        📅 Calendar
      </Link>
    </div>
  );
}
