import "./globals.css";
import type { ReactNode } from "react";
import classNames from "classnames";
import AppShell from "@/components/AppShell";
import ThemeScript from "./theme/ThemeScript";
import { ThemeProvider } from "./theme/ThemeContext";
import Navbar from "@/components/Navbar";


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={classNames(
          "bg-bg text-fg antialiased selection:bg-white/20 dark:selection:bg-white/10",
        )}
      >
        <ThemeProvider>
          <Navbar />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
