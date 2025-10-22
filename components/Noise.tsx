"use client";

import { useEffect } from "react";

import { useTheme, type Theme } from "@/app/theme/ThemeContext";

const NOISE_VARIABLES: Record<Theme, Record<string, string>> = {
  light: {
    "--noise-opacity": "0.22",
    "--noise-filter": "contrast(1.35)",
    "--noise-blend-mode": "multiply",
  },
  dark: {
    "--noise-opacity": "0.18",
    "--noise-filter": "invert(1) brightness(1.2) contrast(1.75)",
    "--noise-blend-mode": "screen",
  },
};

export default function Noise() {
  const { theme } = useTheme();
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const previousValues: Record<string, string | null> = {};

    for (const [property, value] of Object.entries(NOISE_VARIABLES[theme])) {
      previousValues[property] = root.style.getPropertyValue(property) || null;
      root.style.setProperty(property, value);
    }
    return () => {
      for (const [property, previousValue] of Object.entries(previousValues)) {
        if (previousValue === null) {
          root.style.removeProperty(property);
        } else {
          root.style.setProperty(property, previousValue);
        }
      }
    };
  }, [theme]);

  return <div className="noise" data-fall-skip="true" aria-hidden="true" />;
}
