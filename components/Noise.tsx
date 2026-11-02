"use client";

import type { CSSProperties } from "react";

import { useTheme, type Theme } from "@/app/theme/ThemeContext";

// The contrast/invert filters live in the baked textures (noise-light.png /
// noise-dark.png, selected through --noise-image in globals.css), so no live
// CSS filter is needed on this full-screen layer.
const NOISE_STYLE_MAP: Record<Theme, CSSProperties> = {
  light: {
    opacity: 0.22,
    mixBlendMode: "multiply",
  },
  dark: {
    opacity: 0.18,
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
      /**
       * suppressHydrationWarning: o estilo do noise depende do tema, que é
       * determinado no cliente (via localStorage/horário). O ThemeScript
       * aplica o tema correto antes do primeiro paint via CSS classes, mas o
       * React pode detectar uma diferença de style entre SSR e cliente.
       * Como o noise é puramente decorativo, suprimir o aviso é seguro.
       */
      suppressHydrationWarning
      style={style}
    />
  );
}
