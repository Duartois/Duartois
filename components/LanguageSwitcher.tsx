"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/app/i18n/config";

type SupportedLanguage = "pt" | "en";

export default function LanguageSwitcher() {
  const { t } = useTranslation("common");
  const [lang, setLang] = useState<SupportedLanguage>("pt");

  useEffect(() => {
    setLang((i18n.language as SupportedLanguage) || "pt");
    const onChanged = (language: string) =>
      setLang((language as SupportedLanguage) || "pt");

    i18n.on("languageChanged", onChanged);

    return () => {
      i18n.off("languageChanged", onChanged);
    };
  }, []);

  const target: SupportedLanguage = lang === "en" ? "pt" : "en";
  const targetLabel = t(`languageSwitcher.labels.${target}`);
  const switchLabel = t(`languageSwitcher.switchTo.${target}`);
  const currentLabel = t(`languageSwitcher.current.${lang}`);

  return (
    <a
      href="#"
      title={targetLabel}
      aria-label={switchLabel}
      onClick={(event) => {
        event.preventDefault();
        i18n.changeLanguage(target);
      }}
    >
      <span aria-hidden>{targetLabel}</span>
      <span className="visually-hidden">{currentLabel}</span>
    </a>
  );
}