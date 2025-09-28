"use client";
import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;
    const fromDOM =
      (root.getAttribute("data-theme") as Theme) ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeState(fromDOM);
  }, []);

  function setTheme(next: Theme) {
    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    root.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setThemeState(next);
  }

  function toggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return { theme, setTheme, toggle };
}
