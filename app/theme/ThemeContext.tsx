"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getDefaultPalette } from "@/components/three/types";
import { getThreeAppInstance } from "@/app/helpers/threeAppStore";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getTimeBasedTheme(date = new Date()): Theme {
  const hour = date.getHours();
  return hour >= 18 || hour < 5 ? "dark" : "light";
}

function getNextThemeChange(date = new Date()): Date {
  const next = new Date(date);
  const hour = date.getHours();

  if (hour >= 18) {
    next.setDate(date.getDate() + 1);
    next.setHours(5, 0, 0, 0);
    return next;
  }

  if (hour >= 5) {
    next.setHours(18, 0, 0, 0);
    return next;
  }

  next.setHours(5, 0, 0, 0);
  return next;
}

function resolveInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const timeBased = getTimeBasedTheme();
  const stored = window.localStorage.getItem("theme");
  if ((stored === "dark" || stored === "light") && stored === timeBased) {
    return timeBased;
  }

  window.localStorage.setItem("theme", timeBased);
  return timeBased;
}

function syncThreeTheme(next: Theme) {
  if (typeof window === "undefined") {
    return;
  }

  const palette = getDefaultPalette(next);
  getThreeAppInstance()?.setState({ theme: next, palette });
}

function persistTheme(next: Theme) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("theme", next);
  }
  syncThreeTheme(next);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
  document.body?.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    syncThreeTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId: number;

    const schedule = () => {
      const nextChange = getNextThemeChange();
      const delay = Math.max(nextChange.getTime() - Date.now(), 0);

      timeoutId = window.setTimeout(() => {
        const nextTheme = getTimeBasedTheme();
        setThemeState((current) => {
          if (current === nextTheme) {
            return current;
          }
          persistTheme(nextTheme);
          return nextTheme;
        });
        schedule();
      }, delay);
    };

    schedule();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(() => {
      persistTheme(next);
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      persistTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggle,
    }),
    [theme, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
