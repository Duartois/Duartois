"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Preloader from "./Preloader";
import CanvasRoot from "./three/CanvasRoot";
import { MenuProvider } from "./MenuContext";
import RoutePrefetcher from "./RoutePrefetcher";

interface AppShellProps {
  children: ReactNode;
  navbar?: ReactNode;
}

const REVEAL_EVENT = "app-shell:reveal";
const ROUTES_TO_PREFETCH = ["/work", "/about", "/contact"] as const;

export default function AppShell({ children, navbar }: AppShellProps) {
  const [isReady, setIsReady] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const hasDispatchedRevealRef = useRef(false);

  const handleComplete = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      setIsContentVisible(false);
      return;
    }

    const id = requestAnimationFrame(() => {
      setIsContentVisible(true);
    });

    return () => cancelAnimationFrame(id);
  }, [isReady]);

  useEffect(() => {
    const body = document.body;
    if (!body) {
      return;
    }

    if (!isContentVisible) {
      body.dataset.preloading = "true";
      hasDispatchedRevealRef.current = false;
      return;
    }

    body.dataset.preloading = "false";

    if (!hasDispatchedRevealRef.current) {
      hasDispatchedRevealRef.current = true;
      window.dispatchEvent(new Event(REVEAL_EVENT));
    }
  }, [isContentVisible]);

  return (
    <MenuProvider>
      <div className="relative min-h-screen w-full overflow-hidden">
        {!isReady && <Preloader onComplete={handleComplete} />}
        <CanvasRoot isReady={isReady} />
        <RoutePrefetcher routes={ROUTES_TO_PREFETCH} />
        <div
          className={isContentVisible ? "" : "pointer-events-none"}
          aria-hidden={!isContentVisible}
          aria-busy={!isContentVisible}
        >
          {navbar}
          {children}
        </div>
      </div>
    </MenuProvider>
  );
}
