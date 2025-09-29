import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/public/locales/en/common.json";
import ptCommon from "@/public/locales/pt/common.json";

export const defaultNS = "common" as const;

const resources = {
  pt: {
    [defaultNS]: ptCommon,
  },
  en: {
    [defaultNS]: enCommon,
  },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "pt",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    supportedLngs: Object.keys(resources),
    defaultNS,
    ns: [defaultNS],
  });
}

export default i18n;
export type AppTranslation = typeof ptCommon;
