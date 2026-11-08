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

/** Every drop up to and including today stays open without a sign-in. */
export function isGuestOpenDrop(dateKey: string, now = new Date()): boolean {
  return isDateKey(dateKey) && dateKey <= utcDateKey(now);
}
