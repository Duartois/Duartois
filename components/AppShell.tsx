"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Preloader from "./Preloader";
import { MenuProvider } from "./MenuContext";
import RoutePrefetcher from "./RoutePrefetcher";

interface AppShellProps {
  children: ReactNode;
  navbar?: ReactNode;
}

const REVEAL_EVENT = "app-shell:reveal";
const ROUTES_TO_PREFETCH = ["/work", "/about", "/contact"] as const;

const CanvasRoot = dynamic(() => import("./three/CanvasRoot"), {
  ssr: false,
});

export default function AppShell({ children, navbar }: AppShellProps) {
  const [isReady, setIsReady] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const hasDispatchedRevealRef = useRef(false);

  const handleComplete = useCallback(() => {
    setIsReady(true);
    setShowPreloader(false);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setIsContentVisible(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleNavigationClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a");
      if (!anchor) {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      if (href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      if (
        url.pathname === currentUrl.pathname &&
        url.search === currentUrl.search &&
        url.hash === currentUrl.hash
      ) {
        return;
      }

      window.dispatchEvent(new CustomEvent("app-navigation:start"));
    };

    document.addEventListener("click", handleNavigationClick);

    return () => {
      document.removeEventListener("click", handleNavigationClick);
    };
  }, []);

  return (
    <MenuProvider>
      <div className="app-shell relative min-h-screen w-full">
        {showPreloader && <Preloader onComplete={handleComplete} />}
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
