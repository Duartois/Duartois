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
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

type SupportedLang = "pt" | "en";
const defaultLang: SupportedLang = "en";

export const metadata: Metadata = {
  metadataBase: new URL("https://duartois.com"),
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
  openGraph: {
    title: "Duartois",
    description: "Portfólio Duartois.",
    url: "https://duartois.com",
    siteName: "Duartois",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/Logo.svg",
        width: 1200,
        height: 630,
        alt: "Duartois",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Duartois",
    description: "Portfólio Duartois.",
    images: ["/Logo.svg"],
  },
};

export const viewport: Viewport = {
  // viewportFit: "cover" garante que o conteúdo preencha a área segura no iPhone X+
  // (notch, home indicator) sem deixar barras brancas nas bordas.
  viewportFit: "cover",
  // width=device-width + initialScale=1 é o padrão correto para mobile.
  // Não definir maximumScale ou userScalable para preservar acessibilidade.
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2f9" },
    { media: "(prefers-color-scheme: dark)", color: "#2b2b33" },
  ],
};

const normalizeLang = (value?: string | null): SupportedLang | null => {
  if (value === "pt" || value === "en") {
    return value;
  }
  return null;
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLang = normalizeLang(cookieStore.get("i18nextLng")?.value);
  const lang = cookieLang ?? defaultLang;

  return (
    <html lang={lang} translate="no" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <meta name="google" content="notranslate" />
        {/* All but one project asset live on ap-south-1; a second preconnect
            would open a connection that is almost never used. */}
        <link
          rel="preconnect"
          href="https://ap-south-1.graphassets.com"
          crossOrigin="anonymous"
        />
        {/* The UI/body font: found in the HTML instead of after the CSS. */}
        <link
          rel="preload"
          href="/fonts/studio-feixen-sans-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
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
              <SmoothScrollProvider>
                <PWARegister />
                <CustomCursor />
                <AppShell>{children}</AppShell>
              </SmoothScrollProvider>
            </I18nProvider>
          </AnimationQualityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
