"use client";

import { useTheme } from "@/app/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation("common");
  const nextThemeKey = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-switch-btn"
      aria-label={t("themeToggle.ariaLabel", { theme: t(`themeToggle.themes.${nextThemeKey}`) })}
      aria-pressed={theme === "dark"}
      title={t("themeToggle.title", { theme: t(`themeToggle.themes.${theme}`) })}
    >
      {/* Usa exatamente o SVG de lua/sol da referência, animando via translateY */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 17 17"
        width="17"
        height="17"
        className="icons-style mini-icons"
      >
        <title>Theme</title>
        {/* Lua (crescent) */}
        <path
          d="M14.994,7.99a7,7,0,0,1-12.813,3.9,1,1,0,0,1,1.063-1.532,6.139,6.139,0,0,0,1.961.089,6.012,6.012,0,0,0,5.212-4.985,6.067,6.067,0,0,0-.065-2.274A1,1,0,0,1,11.9,2.182,6.985,6.985,0,0,1,14.994,7.99Z"
          style={{
            transform: theme === "dark" ? "translateY(0px)" : "translateY(17px)",
            transformOrigin: "0px 0px",
            transition: "transform 250ms ease",
          }}
        />
        {/* Sol (círculo + raios) */}
        <g
          style={{
            transform: theme === "dark" ? "translateY(17px)" : "translateY(0px)",
            transformOrigin: "0px 0px",
            transition: "transform 250ms ease",
          }}
        >
          <circle cx="8.5" cy="8.5" r="3"></circle>
          <line x1="8.5" y1="1" x2="8.5" y2="2"></line>
          <line x1="13.803" y1="3.197" x2="13.096" y2="3.904"></line>
          <line x1="16" y1="8.5" x2="15" y2="8.5"></line>
          <line x1="13.803" y1="13.803" x2="13.096" y2="13.096"></line>
          <line x1="8.5" y1="16" x2="8.5" y2="15"></line>
          <line x1="3.197" y1="13.803" x2="3.904" y2="13.096"></line>
          <line x1="1" y1="8.5" x2="2" y2="8.5"></line>
          <line x1="3.197" y1="3.197" x2="3.904" y2="3.904"></line>
        </g>
      </svg>
    </button>
  );
}