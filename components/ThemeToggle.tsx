"use client";

import clsx from "classnames";
import { useTheme } from "@/app/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";
import { MoonIcon, SunIcon } from "./icons/ThemeToggleIcons";

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
        "group relative flex h-11 w-11 items-center justify-center rounded-full border border-fg/12 bg-white/70 text-fg/80 shadow-soft backdrop-blur transition-all duration-300 ease-pleasant",
        "hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg/70",
        theme === "dark"
          ? "hover:border-accent3-400/70 hover:text-accent3-200"
          : "hover:border-brand-400/70 hover:text-brand-600",
      )}
      aria-label={t("themeToggle.ariaLabel", { theme: nextThemeLabel })}
      aria-pressed={theme === "dark"}
      title={t("themeToggle.title", { theme: titleThemeLabel })}
    >
      {theme === "dark" ? (
        <MoonIcon
          aria-hidden
          className="h-6 w-6 transform transition-transform duration-300 ease-pleasant group-active:scale-95"
        />
      ) : (
        <SunIcon
          aria-hidden
          className="h-6 w-6 transform transition-transform duration-300 ease-pleasant group-active:scale-95"
        />
      )}
    </button>
  );
}
