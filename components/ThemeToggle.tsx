"use client";

import clsx from "classnames";
import { useTheme } from "@/app/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";
import { MoonIcon, SunIcon } from "./icons/ThemeToggleIcons";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation("common");
  const nextThemeKey = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full ... (mesmas classes existentes) ..."
      aria-label={t("themeToggle.ariaLabel", { theme: t(`themeToggle.themes.${nextThemeKey}`) })}
      aria-pressed={theme === "dark"}
      title={t("themeToggle.title", { theme: t(`themeToggle.themes.${theme}`) })}
    >
      {theme === "dark" ? (
        <SunIcon className="transition-transform duration-300 ease-pleasant group-active:scale-95" />
      ) : (
        <MoonIcon className="transition-transform duration-300 ease-pleasant group-active:scale-95" />
      )}
    </button>
  );
}
