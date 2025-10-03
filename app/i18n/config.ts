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
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("lang");
    if (attr === "pt" || attr === "en") {
      return attr;
    }
  }

  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("i18nextLng");
    if (saved === "en" || saved === "pt") {
      return saved;
    }
  }

  if (typeof navigator !== "undefined") {
    const preferred = navigator.language?.slice(0, 2);
    if (preferred === "en" || preferred === "pt") {
      return preferred;
    }
  }

  return "pt";
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
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem("i18nextLng", lng);
    } catch {}
  }

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", lng);
    try {
      document.cookie = `i18nextLng=${lng}; path=/; max-age=31536000`;
    } catch {}
  }
});

export default i18n;
export type AppTranslation = typeof ptCommon;
