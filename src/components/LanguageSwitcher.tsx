"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import type { Locale } from "@/lib/i18n/types";

const LOCALES: Locale[] = ["sv", "en"];

export function LanguageSwitcher() {
  const { locale, messages, setLocale } = useLanguage();

  return (
    <div
      role="group"
      aria-label={messages.nav.language}
      className="flex rounded-full bg-zinc-100 p-0.5"
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => setLocale(code)}
            className={`min-h-8 rounded-full px-2.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
              active ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
