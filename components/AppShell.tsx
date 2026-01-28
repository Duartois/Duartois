"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import Preloader from "./Preloader";
import { MenuProvider } from "./MenuContext";
import RoutePrefetcher from "./RoutePrefetcher";
import {
  APP_NAVIGATION_END_EVENT,
  APP_NAVIGATION_START_EVENT,
  APP_SHELL_REVEAL_EVENT,
  dispatchAppEvent,
} from "@/app/helpers/appEvents";
import {
  EXIT_NAVIGATION_ATTRIBUTE,
  navigateWithExit,
  resetNavigationState,
} from "@/app/helpers/navigateWithExit";

interface AppShellProps {
  children: ReactNode;
  navbar?: ReactNode;
}

const ROUTES_TO_PREFETCH = ["/work", "/about", "/contact"] as const;

const CanvasRoot = dynamic(() => import("./three/CanvasRoot"), {
  ssr: false,
});

export default function AppShell({ children, navbar }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isNavigationExiting, setIsNavigationExiting] = useState(false);
  const hasDispatchedRevealRef = useRef(false);
  const isContentVisible = !showPreloader;

  const handleComplete = useCallback(() => {
    setIsReady(true);
    setShowPreloader(false);
  }, []);

  useEffect(() => {
    const body = document.body;
    if (!body) {
      return;
    }

    if (showPreloader) {
      body.dataset.preloading = "true";
      hasDispatchedRevealRef.current = false;
      return;
    }

    body.removeAttribute("data-preloading");

    if (!hasDispatchedRevealRef.current) {
      hasDispatchedRevealRef.current = true;
      dispatchAppEvent(APP_SHELL_REVEAL_EVENT);
    }
  }, [showPreloader]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleNavigationClick = (event: MouseEvent) => {
      if (showPreloader) {
        return;
      }
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

      if (anchor.hasAttribute(EXIT_NAVIGATION_ATTRIBUTE)) {
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

      event.preventDefault();
      navigateWithExit(router, `${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("click", handleNavigationClick, true);

    return () => {
      document.removeEventListener("click", handleNavigationClick, true);
    };
  }, [router, showPreloader]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    resetNavigationState();
    const frame = window.requestAnimationFrame(() => {
      dispatchAppEvent(APP_NAVIGATION_END_EVENT);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleNavigationStart = () => {
      setIsNavigationExiting(true);
    };

    const handleNavigationEnd = () => {
      setIsNavigationExiting(false);
    };

    window.addEventListener(APP_NAVIGATION_START_EVENT, handleNavigationStart);
    window.addEventListener(APP_NAVIGATION_END_EVENT, handleNavigationEnd);

    return () => {
      window.removeEventListener(
        APP_NAVIGATION_START_EVENT,
        handleNavigationStart,
      );
      window.removeEventListener(
        APP_NAVIGATION_END_EVENT,
        handleNavigationEnd,
      );
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    if (!body) {
      return;
    }

    if (isNavigationExiting) {
      body.dataset.navigationExiting = "true";
      return;
    }

    delete body.dataset.navigationExiting;
  }, [isNavigationExiting]);

  const contentClassName = [
    isContentVisible ? "" : "pointer-events-none opacity-0",
    isNavigationExiting ? "pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <MenuProvider>
      <div className="app-shell relative min-h-screen w-full">
        {showPreloader && <Preloader onComplete={handleComplete} />}
        <CanvasRoot isReady={isReady} />
        <RoutePrefetcher routes={ROUTES_TO_PREFETCH} />
        <div
          className={contentClassName}
          style={
            isNavigationExiting
              ? {
                  willChange: "transform, opacity",
                  transform: "translateZ(0)",
                }
              : undefined
          }
          data-navigation-exiting={isNavigationExiting ? "true" : undefined}
          aria-hidden={!isContentVisible}
          aria-busy={!isContentVisible || isNavigationExiting}
        >
          {navbar}
          {children}
        </div>
      </div>
    </MenuProvider>
  );
}
