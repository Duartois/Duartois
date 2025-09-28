"use client";

import i18next, { Resource } from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/public/locales/en/common.json";
import frCommon from "@/public/locales/fr/common.json";

const resources = {
  en: {
    common: enCommon,
  },
  fr: {
    common: frCommon,
  },
} satisfies Resource;

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    defaultNS: "common",
    fallbackLng: "en",
    supportedLngs: ["en", "fr"],
    interpolation: {
      escapeValue: false,
    },
  });
}

export { useTranslation } from "react-i18next";
export const i18n = i18next;
