"use client";

import { useTranslation } from "react-i18next";
import clsx from "classnames";
import "@/app/i18n/config";

const LANGUAGES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
] as const;

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "pt").split("-")[0];

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-fg/12 bg-white/70 px-2 py-1 text-[0.6rem] font-medium uppercase tracking-[0.32em] text-fg/70 shadow-soft backdrop-blur">
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
              "rounded-full px-2.5 py-1 transition duration-300 ease-out",
              isActive
                ? "bg-fg text-bg shadow-soft"
                : "text-fg/60 hover:text-fg"
            )}
            aria-pressed={isActive}
            aria-label={t("languageSwitcher.ariaLabel", { label })}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
