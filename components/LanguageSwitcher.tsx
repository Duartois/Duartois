"use client";

import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");
  const currentLang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const languages: Array<"en" | "pt" > = ["en", "pt"];

  return (
    <div className="flex items-center gap-2">
      {languages.map(lang => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          disabled={lang === currentLang}
          className={
            lang === currentLang 
              ? "text-sm font-semibold uppercase tracking-[0.3em] text-fg"                  /* estilo destacado do idioma ativo */
              : "text-sm font-medium uppercase tracking-[0.3em] text-fg/50 hover:text-fg dark:text-fg/60 dark:hover:text-fg"
          }
          aria-label={t("languageSwitcher.ariaLabel")}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}