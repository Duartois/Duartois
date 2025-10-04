import "./globals.css";
import type { ReactNode } from "react";
import classNames from "classnames";
import { cookies } from "next/headers";
import AppShell from "@/components/AppShell";
import ThemeScript from "./theme/ThemeScript";
import { ThemeProvider } from "./theme/ThemeContext";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import I18nProvider from "./i18n/I18nProvider";
import GlobalFallAnimator from "@/components/GlobalFallAnimator";

type SupportedLang = "pt" | "en";

function resolveLanguage(): SupportedLang {
  const cookieStore = cookies();
  const cookieLang = cookieStore.get("i18nextLng")?.value;
  return cookieLang === "en" ? "en" : "pt";
}


export default function RootLayout({ children }: { children: ReactNode }) {
  const lang = resolveLanguage();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={classNames(
          "bg-bg text-fg antialiased selection:bg-white/20 dark:selection:bg-white/10",
        )}
      >
        <ThemeProvider>
          <I18nProvider lang={lang}>
            <GlobalFallAnimator />
            <CustomCursor />
            <Navbar />
            <AppShell>{children}</AppShell>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}