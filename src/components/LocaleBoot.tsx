"use client";

import { useEffect } from "react";
import { hydrateLocaleFromStorage } from "@/lib/i18n/locale-store";
import { hydrateCountryFromStorage } from "@/lib/i18n/profile-preferences";

export function LocaleBoot() {
  useEffect(() => {
    hydrateLocaleFromStorage();
    hydrateCountryFromStorage();
  }, []);

  return null;
}
