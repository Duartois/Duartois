import "./globals.css";
import type { ReactNode } from "react";
import classNames from "classnames";
import AppShell from "@/components/AppShell";
import CanvasRoot from "@/components/three/CanvasRoot";
import ThemeScript from "./theme/ThemeScript";
import { ThemeProvider } from "./theme/ThemeContext";
import { neueMontreal } from "./fonts/fonts";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={classNames(
          neueMontreal.variable,
          neueMontreal.className,
          "bg-bg text-fg antialiased selection:bg-white/20 dark:selection:bg-white/10",
        )}
      >
        <ThemeProvider>
          <CanvasRoot />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
