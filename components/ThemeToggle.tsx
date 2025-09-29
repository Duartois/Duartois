"use client";

import { useTheme } from "@/app/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t, i18n } = useTranslation("common");
  const currentThemeKey = theme === "dark" ? "dark" : "light";
  const nextThemeKey = currentThemeKey === "dark" ? "light" : "dark";
  const nextThemeLabel = t(`themeToggle.themes.${nextThemeKey}`);
  const currentThemeLabel = t(`themeToggle.themes.${currentThemeKey}`);
  const resolvedLanguage = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const shouldCapitalizeTitle = resolvedLanguage !== "pt";
  const titleThemeLabel = shouldCapitalizeTitle
    ? currentThemeLabel.charAt(0).toUpperCase() + currentThemeLabel.slice(1)
    : currentThemeLabel;

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-fg/20 bg-bg/90 text-lg text-fg shadow-soft transition hover:border-fg/40 hover:bg-fg/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg dark:border-fg/30 dark:hover:border-fg/60"
      aria-label={t("themeToggle.ariaLabel", { theme: nextThemeLabel })}
      aria-pressed={theme === "dark"}
      title={t("themeToggle.title", { theme: titleThemeLabel })}
    >
      <span aria-hidden>{theme === "dark" ? "🌙" : "☀️"}</span>
    </button>
  );
}
