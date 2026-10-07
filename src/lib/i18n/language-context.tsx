"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { en } from "./en";
import {
  getLocaleSnapshot,
  getServerLocale,
  setLocale as storeLocale,
  subscribeLocale,
} from "./locale-store";
import {
  getCountrySnapshot,
  getServerCountry,
  setCountry as storeCountry,
  subscribeCountry,
} from "./profile-preferences";
import { sv } from "./sv";
import type { Locale, Messages } from "./types";
import type { ScoutCountry } from "./profile-preferences";

export interface LanguageContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (next: Locale) => void;
  country: ScoutCountry;
  setCountry: (next: ScoutCountry) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function useLanguageState(): LanguageContextValue {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getServerLocale);
  const country = useSyncExternalStore(subscribeCountry, getCountrySnapshot, getServerCountry);
  return {
    locale,
    messages: locale === "en" ? en : sv,
    setLocale: storeLocale,
    country,
    setCountry: storeCountry,
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const value = useLanguageState();
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  const fallback = useLanguageState();
  return context ?? fallback;
}
