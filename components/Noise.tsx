"use client";

import type { CSSProperties } from "react";

import { useTheme, type Theme } from "@/app/theme/ThemeContext";

const NOISE_STYLE_MAP: Record<Theme, CSSProperties> = {
  light: {
    opacity: 0.22,
    filter: "contrast(1.35)",
    mixBlendMode: "multiply",
  },
  dark: {
    opacity: 0.18,
    filter: "invert(1) brightness(1.2) contrast(1.75)",
    mixBlendMode: "screen",
  },
};

export default function Noise() {
  const { theme } = useTheme();
  const style = NOISE_STYLE_MAP[theme];

  return (
    <div
      className="noise"
      data-fall-skip="true"
      aria-hidden="true"
      style={style}
    />
  );
}
