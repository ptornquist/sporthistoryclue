'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Language = 'sv' | 'en';

const STORAGE_KEY = 'shc_language';
const DEFAULT_LANGUAGE: Language = 'sv';

interface LanguageContextValue {
  language: Language;
  setLanguage: (next: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => undefined,
});

export function readStoredLanguage(storage: Pick<Storage, 'getItem'> | null): Language {
  if (!storage) return DEFAULT_LANGUAGE;
  const raw = storage.getItem(STORAGE_KEY);
  return raw === 'en' || raw === 'sv' ? raw : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    typeof window === 'undefined' ? DEFAULT_LANGUAGE : readStoredLanguage(window.localStorage),
  );

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing can block writes; the in-memory choice still applies.
    }
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
