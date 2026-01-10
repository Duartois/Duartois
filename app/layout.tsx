import "./globals.css";
import type { ReactNode } from "react";
import classNames from "classnames";
import AppShell from "@/components/AppShell";
import ThemeScript from "./theme/ThemeScript";
import { ThemeProvider } from "./theme/ThemeContext";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import I18nProvider from "./i18n/I18nProvider";

type SupportedLang = "pt" | "en";
const defaultLang: SupportedLang = "en";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLang} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link
          rel="preconnect"
          href="https://eu-central-1.graphassets.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://ap-south-1.graphassets.com"
          crossOrigin=""
        />
        <link rel="preload" href="/about-01.avif" as="image" type="image/avif" />
        <link rel="preload" href="/noise.png" as="image" type="image/png" />
        <link
          rel="preload"
          href="/wave-light.svg"
          as="image"
          type="image/svg+xml"
        />
        <link rel="preload" href="/wave.svg" as="image" type="image/svg+xml" />
      </head>
      <body
        data-preloading="true"
        className={classNames(
          "bg-bg text-fg antialiased selection:bg-white/20 dark:selection:bg-white/10",
          "body-scroll-control",
        )}
      >
        <ThemeProvider>
          <I18nProvider>
            <CustomCursor />
            <AppShell navbar={<Navbar />}>{children}</AppShell>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
