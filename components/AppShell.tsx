"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import Preloader from "./Preloader";
import noiseUrl from "@/public/noise.png";
import CanvasRoot from "./three/CanvasRoot";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isReady, setIsReady] = useState(false);
  const [canRenderContent, setCanRenderContent] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  const handleComplete = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      setCanRenderContent(false);
      setIsContentVisible(false);
      return;
    }

    setCanRenderContent(true);

    const id = requestAnimationFrame(() => {
      setIsContentVisible(true);
    });

    return () => cancelAnimationFrame(id);
  }, [isReady]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {!isReady && <Preloader onComplete={handleComplete} />}
      <CanvasRoot isReady={isReady} />
      <div
        className="pointer-events-none fixed inset-0 z-[9999] bg-repeat bg-center opacity-40 mix-blend-soft-light [background-size:220px] dark:opacity-30"
        style={{ backgroundImage: `url(${noiseUrl.src})` }}
        aria-hidden
      />
      {canRenderContent ? (
        <div
          className={`relative z-20 flex min-h-screen w-full flex-col transition-opacity duration-700 ${
            isContentVisible
              ? "visible opacity-100"
              : "pointer-events-none invisible opacity-0"
          }`}
          aria-hidden={!isContentVisible}
          aria-busy={!isContentVisible}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
