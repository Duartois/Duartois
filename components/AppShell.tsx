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
  getFallExitDuration,
} from "./fallAnimation";
import {
  APP_NAVIGATION_END_EVENT,
  APP_NAVIGATION_START_EVENT,
  APP_SHELL_REVEAL_EVENT,
  dispatchAppEvent,
} from "@/app/helpers/appEvents";
import { applyNavigationSceneVariant } from "@/app/helpers/threeNavigation";

interface AppShellProps {
  children: ReactNode;
  navbar?: ReactNode;
}

const ROUTES_TO_PREFETCH = ["/work", "/about", "/contact"] as const;
const NAVIGATION_EXIT_DURATION = getFallExitDuration(6, "work");

const CanvasRoot = dynamic(() => import("./three/CanvasRoot"), {
  ssr: false,
});

export default function AppShell({ children, navbar }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const hasDispatchedRevealRef = useRef(false);
  const isContentVisible = !showPreloader;
  const navigationTimeoutRef = useRef<number | undefined>(undefined);
  const isNavigatingRef = useRef(false);

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

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      applyNavigationSceneVariant(url.pathname);
      dispatchAppEvent(APP_NAVIGATION_START_EVENT);

      if (prefersReducedMotion) {
        return;
      }

      event.preventDefault();

      if (isNavigatingRef.current) {
        return;
      }

      isNavigatingRef.current = true;

      if (navigationTimeoutRef.current) {
        window.clearTimeout(navigationTimeoutRef.current);
      }

      const navigationExitDuration = Number(
        document.body?.dataset.navigationExitDuration,
      );
      const exitDuration = Number.isFinite(navigationExitDuration)
        ? navigationExitDuration
        : NAVIGATION_EXIT_DURATION;

      navigationTimeoutRef.current = window.setTimeout(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }, exitDuration);
    };

    document.addEventListener("click", handleNavigationClick, true);

    return () => {
      document.removeEventListener("click", handleNavigationClick, true);
      if (navigationTimeoutRef.current) {
        window.clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = undefined;
      }
      isNavigatingRef.current = false;
    };
  }, [router, showPreloader]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (navigationTimeoutRef.current) {
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = undefined;
    }

    isNavigatingRef.current = false;
    dispatchAppEvent(APP_NAVIGATION_END_EVENT);
  }, [pathname]);

  return (
    <MenuProvider>
      <div className="app-shell relative min-h-screen w-full">
        {showPreloader && <Preloader onComplete={handleComplete} />}
        <CanvasRoot isReady={isReady} />
        <RoutePrefetcher routes={ROUTES_TO_PREFETCH} />
        <div
          className={isContentVisible ? "" : "pointer-events-none opacity-0"}
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
