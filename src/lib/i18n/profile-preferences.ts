export const COUNTRY_STORAGE_KEY = "shc_country";

export const SCOUT_COUNTRIES = ["se", "gb", "us", "ca", "world"] as const;

export type ScoutCountry = (typeof SCOUT_COUNTRIES)[number];

let country: ScoutCountry = "world";
const listeners = new Set<() => void>();

export function isScoutCountry(value: string | null | undefined): value is ScoutCountry {
  return SCOUT_COUNTRIES.some((item) => item === value);
}

export function getCountrySnapshot(): ScoutCountry {
  return country;
}

export function getServerCountry(): ScoutCountry {
  return "world";
}

export function subscribeCountry(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function publish(next: ScoutCountry) {
  country = next;
  for (const listener of listeners) listener();
}

export function setCountry(next: ScoutCountry) {
  if (!isScoutCountry(next)) return;
  try {
    window.localStorage.setItem(COUNTRY_STORAGE_KEY, next);
  } catch {
    // The in-memory choice still drives the club list.
  }
  if (next !== country) publish(next);
}

export function hydrateCountryFromStorage() {
  try {
    const stored = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (!isScoutCountry(stored) || stored === country) return;
    publish(stored);
  } catch {
    // Ignore unavailable storage during the first client paint.
  }
}
