import "./globals.css";
import type { ReactNode } from "react";
import classNames from "classnames";
import AppShell from "@/components/AppShell";
import ThemeScript from "./theme/ThemeScript";
import { ThemeProvider } from "./theme/ThemeContext";
import Navbar from "@/components/Navbar";
import I18nGate from "@/app/i18n/I18nGate";
import Providers from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={classNames(
          "bg-bg text-fg antialiased selection:bg-white/20 dark:selection:bg-white/10",
        )}
      >
        <Providers>
          <I18nGate>
            <ThemeProvider>
              <Navbar />
              <AppShell>{children}</AppShell>
            </ThemeProvider>
          </I18nGate>
        </Providers>
      </body>
    </html>
  );
}