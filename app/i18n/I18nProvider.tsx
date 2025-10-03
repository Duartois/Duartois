"use client";

import { ReactNode, useEffect } from "react";

import i18n from "./config";

type SupportedLang = "pt" | "en";

interface I18nProviderProps {
  lang: SupportedLang;
  children: ReactNode;
}

export default function I18nProvider({ lang, children }: I18nProviderProps) {
  if (typeof window === "undefined" && i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }

  useEffect(() => {
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [lang]);

  return <>{children}</>;
}
