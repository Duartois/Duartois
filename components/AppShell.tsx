"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import Preloader from "./Preloader";
import Noise from "./Noise";
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
      <Noise className="z-[60]" />
      {!isReady && <Preloader onComplete={handleComplete} />}
      <CanvasRoot isReady={isReady} />
      {canRenderContent ? (
        <div
          className={`${
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
