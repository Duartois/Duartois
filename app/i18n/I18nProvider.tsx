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
   * Garante consistência SSR/CSR: se o idioma do request já veio do layout
   * (cookie), sincronizamos a instância do i18n antes da hidratação.
   *
   * Sem isso, o servidor pode renderizar com um idioma e o cliente iniciar
   * com outro (ex.: localStorage), causando React error #418 (text mismatch).
   */
  if (lang && i18n.language !== lang) {
    void i18n.changeLanguage(lang);
  }

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
