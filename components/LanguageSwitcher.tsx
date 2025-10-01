"use client";

import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

export default function LanguageSwitcher() {
  const { t } = useTranslation("common");

  return (
    <span
      className="inline-flex items-center rounded-full border border-fg/12 bg-white/70 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.32em] text-fg/70 shadow-soft backdrop-blur"
      aria-label={t("languageSwitcher.ariaLabel")}
    >
      EN
    </span>
  );
}
