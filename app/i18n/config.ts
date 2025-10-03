"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/public/locales/en/common.json";
import ptCommon from "@/public/locales/pt/common.json";

export const defaultNS = "common" as const;
const resources = {
  pt: { [defaultNS]: ptCommon },
  en: { [defaultNS]: enCommon },
} as const;

function getInitialLng(): "pt" | "en" {
  if (typeof window === "undefined") return "pt";
  const saved = localStorage.getItem("i18nextLng");
  return saved === "en" ? "en" : "pt";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLng(),
    fallbackLng: "en",
    supportedLngs: ["pt", "en"],
    defaultNS,
    ns: [defaultNS],
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
      bindI18n: "languageChanged loaded",
      bindI18nStore: "added removed",
    },
    returnNull: false,
  });
}

i18n.on("languageChanged", (lng) => {
  try { localStorage.setItem("i18nextLng", lng); } catch {}
  if (typeof document !== "undefined") document.documentElement.setAttribute("lang", lng);
});

export default i18n;
export type AppTranslation = typeof ptCommon;
