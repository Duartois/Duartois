"use client";

import { ReactNode, useEffect } from "react";

import i18n from "./config";

type SupportedLang = "pt" | "en";

interface I18nProviderProps {
  lang?: SupportedLang;
  children: ReactNode;
}

export default function I18nProvider({ lang, children }: I18nProviderProps) {
  /**
   * Hydration fix: o bloco `if (typeof window === "undefined")` executava
   * `i18n.changeLanguage` de forma síncrona durante a renderização do
   * componente no servidor, o que pode causar divergências entre o HTML
   * gerado pelo SSR e o que o cliente espera (React error #418).
   *
   * A sincronização de idioma é movida inteiramente para useEffect, que
   * só executa no cliente após a hidratação.
   */
  useEffect(() => {
    if (!lang) {
      return;
    }
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [lang]);

  return <>{children}</>;
}
