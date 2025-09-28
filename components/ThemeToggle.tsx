"use client";
import { useTranslation } from "@/app/i18n/client";
import { useTheme } from "../app/lib/useTheme";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="btn-secondary h-9 px-3 rounded-lg"
      aria-label={t("themeToggle.label")}
      title={t("themeToggle.label")}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
