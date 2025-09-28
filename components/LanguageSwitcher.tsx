"use client";

import { ChangeEvent, useEffect } from "react";
import { useTranslation } from "@/app/i18n/client";

const SUPPORTED_LANGUAGES = ["en", "fr"] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export default function LanguageSwitcher() {
  const { t, i18n: i18nextInstance } = useTranslation();
  const currentLanguage = (i18nextInstance.language || "en").split("-")[0] as SupportedLanguage;

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.includes(newLanguage) && newLanguage !== currentLanguage) {
      i18nextInstance.changeLanguage(newLanguage);
    }
  };

  return (
    <label className="flex flex-col gap-2 text-xs tracking-[0.4em] text-fg/40">
      <span>{t("languageSwitcher.label")}</span>
      <select
        value={currentLanguage}
        onChange={handleChange}
        className="rounded-full border border-fg/20 bg-transparent px-5 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.35em] text-fg transition hover:border-fg/40 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
        aria-label={t("languageSwitcher.label")}
      >
        <option value="en" className="bg-bg text-fg">
          {t("languageSwitcher.languages.en")}
        </option>
        <option value="fr" className="bg-bg text-fg">
          {t("languageSwitcher.languages.fr")}
        </option>
      </select>
    </label>
  );
}
