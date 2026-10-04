const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function utcDateKey(now = new Date()): string {
  return now.toISOString().split("T")[0];
}

export function shiftUtcDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().split("T")[0];
}

export function isDateKey(value: string | null | undefined): value is string {
  return Boolean(value && DATE_KEY.test(value));
}

/** Today and yesterday stay open without an archive sign-in. */
export function isGuestOpenDrop(dateKey: string, now = new Date()): boolean {
  const today = utcDateKey(now);
  return dateKey === today || dateKey === shiftUtcDateKey(today, -1);
}

/** A daily kluring is playable once its UTC date has arrived. */
export function isReleasedDrop(dateKey: string, now = new Date()): boolean {
  return isDateKey(dateKey) && dateKey <= utcDateKey(now);
}
