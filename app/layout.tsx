import "./globals.css";
import type { ReactNode } from "react";
import ThemeScript from "./theme/ThemeScript";
import AppShell from "@/components/AppShell";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-bg text-fg antialiased selection:bg-white/20 dark:selection:bg-white/10">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
