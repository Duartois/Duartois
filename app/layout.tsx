import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import classNames from "classnames";
import { cookies } from "next/headers";
import AppShell from "@/components/AppShell";
import ThemeScript from "./theme/ThemeScript";
import { ThemeProvider } from "./theme/ThemeContext";
import CustomCursor from "@/components/CustomCursor";
import I18nProvider from "./i18n/I18nProvider";
import { AnimationQualityProvider } from "@/components/AnimationQualityContext";
import PWARegister from "./pwa/PWARegister";

type SupportedLang = "pt" | "en";
const defaultLang: SupportedLang = "en";

export const metadata: Metadata = {
  title: "Duartois",
  description: "Portfólio Duartois.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Duartois",
  },
  icons: {
    icon: "/Logo.svg",
    apple: "/Logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
};

const normalizeLang = (value?: string | null): SupportedLang | null => {
  if (value === "pt" || value === "en") {
    return value;
  }
  return null;
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLang = normalizeLang(cookieStore.get("i18nextLng")?.value);
  const lang = cookieLang ?? defaultLang;

  return (
    <html lang={lang} translate="no" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <meta name="google" content="notranslate" />
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
        <link
          rel="preload"
          href="/fonts/studio-feixen-sans-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/StudioFeixenSans-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/StudioFeixenSansWriter-Regular.woff2"
          as="font"
          type="font/woff2"
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
        suppressHydrationWarning
        className={classNames(
          "bg-bg text-fg antialiased selection:bg-white/20 dark:selection:bg-white/10",
          "body-scroll-control",
        )}
      >
        <ThemeProvider>
          <AnimationQualityProvider>
            <I18nProvider lang={lang}>
              <PWARegister />
              <CustomCursor />
              <AppShell>{children}</AppShell>
            </I18nProvider>
          </AnimationQualityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
