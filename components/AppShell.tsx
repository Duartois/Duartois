"use client";

import { ReactNode, useCallback, useState } from "react";
import Preloader from "./Preloader";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isReady, setIsReady] = useState(false);

  const handleComplete = useCallback(() => {
    setIsReady(true);
  }, []);

  return (
    <>
      {!isReady && <Preloader onComplete={handleComplete} />}
      <div
        className={`transition-opacity duration-700 ${
          isReady ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isReady}
        aria-busy={!isReady}
      >
        <div className="pointer-events-auto fixed bottom-6 left-6 z-40 flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        {children}
      </div>
    </>
  );
}
