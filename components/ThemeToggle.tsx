"use client";
import { useTheme } from "../app/lib/useTheme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="btn-secondary h-9 px-3 rounded-lg"
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
