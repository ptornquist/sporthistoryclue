"use client";

import { useSyncExternalStore } from "react";
import { en } from "./en";
import { getLocaleSnapshot, getServerLocale, setLocale, subscribeLocale } from "./locale-store";
import { sv } from "./sv";
import type { Locale, Messages } from "./types";

export function useI18n(): {
  locale: Locale;
  messages: Messages;
  setLocale: (next: Locale) => void;
} {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getServerLocale);
  return {
    locale,
    messages: locale === "en" ? en : sv,
    setLocale,
  };
}
