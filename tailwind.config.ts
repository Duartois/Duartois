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
        // Rampas pastéis para os novos acentos do tema
        brand: {
          50: "#f4ffe7",
          100: "#e8ffc8",
          200: "#d4ff9d",
          300: "#b6f972",
          400: "#9ae752",
          500: "#6ecd29",
          600: "#4da01f",
          700: "#37781b",
          800: "#285c18",
          900: "#1e4715"
        },
        accent1: {
          50: "#fff5fa",
          100: "#ffe7f2",
          200: "#ffcee4",
          300: "#ffafd1",
          400: "#ff8fbb",
          500: "#f96aa7",
          600: "#df4c8b",
          700: "#b8366d",
          800: "#8e274f",
          900: "#6c1d3b"
        },
        accent2: {
          50: "#f9f5ff",
          100: "#f1e8ff",
          200: "#e3d4ff",
          300: "#ceb5ff",
          400: "#b391f6",
          500: "#9472dd",
          600: "#7657bd",
          700: "#5c4395",
          800: "#443171",
          900: "#322456"
        },
        accent3: {
          50: "#e8fffc",
          100: "#c8fff4",
          200: "#99f7ea",
          300: "#6ae7dd",
          400: "#3ecfd0",
          500: "#1fb0ba",
          600: "#188c99",
          700: "#136d79",
          800: "#0f535e",
          900: "#0b4048"
        }
      },
      // sombras e transições suaves
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0,0,0,0.35)",
      },
      transitionTimingFunction: {
        pleasant: "cubic-bezier(.22,.61,.36,1)",
      },
    }
  },
  plugins: [],
};

export default config;
