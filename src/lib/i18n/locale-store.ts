import type { Locale } from "./types";

export const LOCALE_STORAGE_KEY = "shc_locale";

let current: Locale = "sv";
const listeners = new Set<() => void>();

export function getLocaleSnapshot(): Locale {
  return current;
}

export function getServerLocale(): Locale {
  return "sv";
}

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function publish(next: Locale) {
  current = next;
  for (const listener of listeners) listener();
}

export function setLocale(next: Locale) {
  if (next !== "sv" && next !== "en") return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.documentElement.lang = next;
  } catch {
    // Storage can be blocked; the in-memory choice still applies.
  }
  if (next !== current) publish(next);
}

export function hydrateLocaleFromStorage() {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored !== "sv" && stored !== "en") return;
    document.documentElement.lang = stored;
    if (stored !== current) publish(stored);
  } catch {
    // Ignore unavailable storage during the first client paint.
  }
}
