"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Preloader from "./Preloader";
import { MenuProvider } from "./MenuContext";
import RoutePrefetcher from "./RoutePrefetcher";
import {
  FALL_ITEM_STAGGER_DELAY,
  FALL_ITEM_TRANSITION_DURATION,
} from "./fallAnimation";

interface AppShellProps {
  children: ReactNode;
  navbar?: ReactNode;
}

const REVEAL_EVENT = "app-shell:reveal";
const ROUTES_TO_PREFETCH = ["/work", "/about", "/contact"] as const;
const NAVIGATION_EXIT_DURATION =
  FALL_ITEM_TRANSITION_DURATION + FALL_ITEM_STAGGER_DELAY * 6;

const CanvasRoot = dynamic(() => import("./three/CanvasRoot"), {
  ssr: false,
});

export default function AppShell({ children, navbar }: AppShellProps) {
  const router = useRouter();
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

    body.dataset.preloading = "false";

    if (!hasDispatchedRevealRef.current) {
      hasDispatchedRevealRef.current = true;
      window.dispatchEvent(new Event(REVEAL_EVENT));
    }
  }, [showPreloader]);

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

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      window.dispatchEvent(new CustomEvent("app-navigation:start"));

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

      navigationTimeoutRef.current = window.setTimeout(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }, NAVIGATION_EXIT_DURATION);
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
  }, [router]);

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
