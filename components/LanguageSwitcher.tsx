"use client";

import { useEffect, useState } from "react";
import i18n from "@/app/i18n/config";

type SupportedLanguage = "pt" | "en";

const normalizeLanguage = (lng?: string | null): SupportedLanguage => {
  if (!lng) return "pt";
  return lng.startsWith("en") ? "en" : "pt";
};

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<SupportedLanguage>(
    normalizeLanguage(i18n.language)
  );
  useEffect(() => {
    const onChanged = (l: string) => setLang(normalizeLanguage(l));
    i18n.on("languageChanged", onChanged);
    setLang(normalizeLanguage(i18n.language));
    return () => i18n.off("languageChanged", onChanged);
  }, []);
  const target: SupportedLanguage = lang === "en" ? "pt" : "en";

  return (
    <a
      href="#"
      title={target.toUpperCase()}
      aria-label={target === "en" ? "Switch to English" : "Mudar para Português"}
      onClick={(e) => {
        e.preventDefault();
        i18n.changeLanguage(target);
      }}
    >
      {target.toUpperCase()}
    </a>
  );
}