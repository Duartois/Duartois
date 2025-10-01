"use client";

import clsx from "classnames";
import { useTheme } from "@/app/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";
import { MoonIcon } from "./icons/ThemeToggleIcons";

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
      className={clsx(
        "group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-accent3-400/50 bg-white/80 text-accent3-600 shadow-[0_14px_34px_-18px_rgba(31,176,186,0.85)] backdrop-blur transition-[transform,box-shadow,border-color,background-color,color] duration-300 ease-pleasant",
        "hover:-translate-y-0.5 hover:border-accent3-300 hover:bg-accent3-400/10 hover:text-accent3-200 hover:shadow-[0_18px_40px_-18px_rgba(31,176,186,0.9)]",
        "active:translate-y-0 active:scale-95 active:border-accent3-300/80 active:bg-accent3-400/15 active:text-accent3-100 active:shadow-[0_10px_26px_-18px_rgba(31,176,186,0.95)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent3-200",
        "dark:border-accent3-300/60 dark:bg-accent3-500/10 dark:text-accent3-200",
      )}
      aria-label={t("themeToggle.ariaLabel", { theme: nextThemeLabel })}
      aria-pressed={theme === "dark"}
      title={t("themeToggle.title", { theme: titleThemeLabel })}
    >
      <MoonIcon
        aria-hidden
        className="h-6 w-6 transition-transform duration-300 ease-pleasant group-active:scale-95"
      />
    </button>
  );
}
