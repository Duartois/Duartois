"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useSequentialReveal from "@/app/helpers/useSequentialReveal";
import Preloader from "./Preloader";
import CanvasRoot from "./three/CanvasRoot";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isReady, setIsReady] = useState(false);
  const [canRenderContent, setCanRenderContent] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  useSequentialReveal(containerRef, isContentVisible);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {!isReady && <Preloader onComplete={handleComplete} />}
      <CanvasRoot isReady={isReady} />
      {canRenderContent ? (
        <div
          ref={containerRef}
          className={isContentVisible ? "" : "pointer-events-none"}
          aria-hidden={!isContentVisible}
          aria-busy={!isContentVisible}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
