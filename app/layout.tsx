import "./globals.css";
import type { ReactNode } from "react";
import classNames from "classnames";
import { cookies, headers } from "next/headers";
import AppShell from "@/components/AppShell";
import ThemeScript from "./theme/ThemeScript";
import { ThemeProvider } from "./theme/ThemeContext";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import I18nProvider from "./i18n/I18nProvider";

type SupportedLang = "pt" | "en";

function resolveLanguage(): SupportedLang {
  const cookieStore = cookies();
  const cookieLang = cookieStore.get("i18nextLng")?.value;
  if (cookieLang === "en" || cookieLang === "pt") {
    return cookieLang;
  }

  const headerStore = headers();
  const acceptLanguage = headerStore.get("accept-language");
  if (acceptLanguage) {
    const locales = acceptLanguage
      .split(",")
      .map((part) => part.trim().split(";")[0]?.toLowerCase())
      .filter(Boolean) as string[];

    for (const locale of locales) {
      if (locale.startsWith("pt")) {
        return "pt";
      }
      if (locale.startsWith("en")) {
        return "en";
      }
    }
  }

  return "en";
}


export default function RootLayout({ children }: { children: ReactNode }) {
  const lang = resolveLanguage();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        data-preloading="true"
        className={classNames(
          "bg-bg text-fg antialiased selection:bg-white/20 dark:selection:bg-white/10",
          "body-scroll-control",
        )}
      >
        <ThemeProvider>
          <I18nProvider lang={lang}>
            <CustomCursor />
            <AppShell navbar={<Navbar />}>{children}</AppShell>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}