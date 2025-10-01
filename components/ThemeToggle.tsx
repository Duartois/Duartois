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
        "group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-bg/85 text-fg shadow-[0_14px_34px_-18px_rgb(var(--color-fg)_/_0.18)] backdrop-blur transition-[transform,box-shadow,border-color,background-color,color] duration-300 ease-pleasant",
        "hover:-translate-y-0.5 hover:border-fg/25 hover:bg-bg hover:text-fg hover:shadow-[0_18px_40px_-18px_rgb(var(--color-fg)_/_0.22)]",
        "active:translate-y-0 active:scale-95 active:border-fg/30 active:bg-bg/80 active:shadow-[0_10px_26px_-18px_rgb(var(--color-fg)_/_0.26)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg/70",
        "dark:border-fg/25 dark:bg-bg/40 dark:text-fg dark:hover:bg-bg/35 dark:active:bg-bg/30",
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
