"use client";

import { useEffect, useState, type CSSProperties } from "react";
import i18n from "@/app/i18n/config";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<"pt" | "en">("pt");
  useEffect(() => {
    setLang((i18n.language as any) || "pt");
    const onChanged = (l: string) => setLang((l as any) || "pt");
    i18n.on("languageChanged", onChanged);
    return () => i18n.off("languageChanged", onChanged);
  }, []);
  const target = lang === "en" ? "pt" : "en";

  return (
    <a
      href="#"
      title={target.toUpperCase()}
      aria-label={target === "en" ? "Switch to English" : "Mudar para Português"}
      onClick={(e) => {
        e.preventDefault();
        i18n.changeLanguage(target);
      }}
      className="fall-down-element"
      style={{ "--fall-delay": "0.2s" } as CSSProperties}
    >
      {target.toUpperCase()}
    </a>
  );
}