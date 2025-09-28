"use client";

import { ReactNode, useCallback, useState } from "react";
import Preloader from "./Preloader";

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
        {children}
      </div>
    </>
  );
}
