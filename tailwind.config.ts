import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // vamos alternar colocando/removendo a classe 'dark' no <html>
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      fontFamily: {
        sans: [
          "var(--font-neue-montreal)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        // Paleta base em cima de variáveis (permite trocar tema sem rebuild)
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        flamingo: "#ffb3c2",
        azure: "#99b9ff",
        spring: "#78ffd1",
        lime: "#f0ffa6",
        dark: "#2b2b33",
      },
      // sombras e transições suaves
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0,0,0,0.35)",
      },
      transitionTimingFunction: {
        pleasant: "cubic-bezier(.22,.61,.36,1)",
      },
      keyframes: {
        wave: {
          "0%": { backgroundPositionX: "0%" },
          "100%": { backgroundPositionX: "100%" },
        },
      },
      animation: {
        wave: "wave 2.4s linear infinite",
      },
    }
  },
  plugins: [],
};

export default config;
