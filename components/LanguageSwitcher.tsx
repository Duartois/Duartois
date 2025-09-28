"use client";

import { useTranslation } from "react-i18next";
import clsx from "classnames";
import "@/app/i18n/config";

const LANGUAGES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
] as const;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "pt").split("-")[0];

  return (
    <div className="flex items-center gap-1 rounded-full border border-fg/15 bg-bg/80 px-1.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-fg shadow-soft backdrop-blur">
      {LANGUAGES.map(({ code, label }) => {
        const isActive = currentLanguage === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => {
              if (currentLanguage !== code) {
                void i18n.changeLanguage(code);
              }
            }}
            className={clsx(
              "rounded-full px-3 py-1 transition",
              isActive
                ? "bg-fg text-bg shadow-soft"
                : "text-fg/70 hover:text-fg"
            )}
            aria-pressed={isActive}
            aria-label={`Alterar idioma para ${label}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
