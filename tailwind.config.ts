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
        // ajuste pra tua fonte (usa system por padrão)
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial"],
      },
      colors: {
        // Paleta base em cima de variáveis (permite trocar tema sem rebuild)
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        // Paleta “Sharlee vibes” para gradientes/materiais
        brand: {
          50:  "#eef3ff",
          100: "#d7e4ff",
          200: "#b9d2ff",
          300: "#93b8ff",
          400: "#7ab6ff",
          500: "#4b8dff",
          600: "#2a63e6",
          700: "#1f49b3",
          800: "#193a8f",
          900: "#142e73"
        },
        candy: {
          50:  "#fff1f6",
          100: "#ffd6e7",
          300: "#ff9cc7",
          500: "#ff5fa7",
          700: "#e23d8b"
        },
        lime: {
          50:  "#eeffef",
          100: "#e8ffd1",
          300: "#b8f9b0",
          500: "#62ff9a",
          700: "#28b56f"
        },
        amber: {
          50:  "#fff9e8",
          100: "#fff7cc",
          300: "#ffea85",
          500: "#ffd262",
          700: "#d1a53b"
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
