"use client";

import { useEffect } from "react";
import { hydrateLocaleFromStorage } from "@/lib/i18n/locale-store";

export function LocaleBoot() {
  useEffect(() => {
    hydrateLocaleFromStorage();
  }, []);

  return null;
}
