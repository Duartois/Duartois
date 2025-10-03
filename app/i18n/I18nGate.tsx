"use client";

import { useEffect, useState } from "react";
import i18n from "@/app/i18n/config";

export default function I18nGate({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<"pt" | "en">((i18n.language as any) || "pt");
  useEffect(() => {
    const onChanged = (l: string) => setLang((l as any) || "pt");
    i18n.on("languageChanged", onChanged);
    return () => i18n.off("languageChanged", onChanged);
  }, []);
  return <div key={lang}>{children}</div>;
}