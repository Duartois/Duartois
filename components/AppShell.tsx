"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { MenuProvider } from "./MenuContext";
import PerfDebugLogger from "./PerfDebugLogger";
import { AnimationQualityProvider } from "./AnimationQualityContext";
import { isPerfDebugEnabled, logPerf } from "@/app/helpers/perfDebug";

interface AppShellProps {
  children: ReactNode;
  navbar?: ReactNode;
}

const REVEAL_EVENT = "app-shell:reveal";

const CanvasRoot = dynamic(() => import("./three/CanvasRoot"), {
  ssr: false,
});

const Preloader = dynamic(() => import("./Preloader"), {
  ssr: false,
});

export default function AppShell({ children, navbar }: AppShellProps) {
  const [isReady, setIsReady] = useState(false);
  const showPreloader = useMemo(
    () => process.env.NEXT_PUBLIC_SHOW_PRELOADER === "true",
    [],
  );
  const hasDispatchedRevealRef = useRef(false);
  const pathname = usePathname();
  const showCanvas =
    pathname === "/" || pathname?.startsWith("/work");

  const handleComplete = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!showPreloader) {
      setIsReady(true);
    }
  }, [showPreloader]);

  useEffect(() => {
    const body = document.body;
    if (!body) {
      return;
    }

    body.dataset.preloading = showPreloader ? "true" : "false";

    if (!hasDispatchedRevealRef.current) {
      hasDispatchedRevealRef.current = true;
      window.dispatchEvent(new Event(REVEAL_EVENT));
    }
  }, [showPreloader]);

  useEffect(() => {
    if (!isPerfDebugEnabled || typeof window === "undefined") {
      return;
    }

    performance.mark("app:content-visible");
    logPerf("Content visible marker set.");
  }, []);

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
      <AnimationQualityProvider>
        <div className="app-shell relative min-h-screen w-full">
          <PerfDebugLogger />
          {showPreloader && <Preloader onComplete={handleComplete} />}
          {showCanvas ? <CanvasRoot isReady={isReady} /> : null}
          <div>
            {navbar}
            {children}
          </div>
        </div>
      </AnimationQualityProvider>
    </MenuProvider>
  );
}
