"use client";

import { useTheme } from "@/app/theme/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  const nextThemeLabel = theme === "dark" ? "claro" : "escuro";

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-fg/20 bg-bg/90 text-lg text-fg shadow-soft transition hover:border-fg/40 hover:bg-fg/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg dark:border-fg/30 dark:hover:border-fg/60"
      aria-label={`Alternar para o tema ${nextThemeLabel}`}
      aria-pressed={theme === "dark"}
      title={`Tema ${theme === "dark" ? "escuro" : "claro"}`}
    >
      <span aria-hidden>{theme === "dark" ? "🌙" : "☀️"}</span>
    </button>
  );
}
