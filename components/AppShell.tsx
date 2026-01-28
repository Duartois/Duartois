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
  APP_NAVIGATION_END_EVENT,
  APP_NAVIGATION_START_EVENT,
  APP_SHELL_REVEAL_EVENT,
  dispatchAppEvent,
} from "@/app/helpers/appEvents";
import {
  EXIT_NAVIGATION_ATTRIBUTE,
  navigateWithExit,
} from "@/app/helpers/navigateWithExit";
import {
  applyStoredSceneState,
  getStoredSceneState,
  hasStoredSceneState,
  updateStoredSceneState,
} from "@/app/helpers/threeSceneStore";
import type { ThreeAppState } from "@/components/three/types";
import { ThreeAppProvider, useThreeApp } from "@/app/helpers/threeAppContext";

interface AppShellProps {
  children: ReactNode;
}

const ROUTES_TO_PREFETCH = ["/work", "/about", "/contact"] as const;

const CanvasRoot = dynamic(() => import("./three/CanvasRoot"), {
  ssr: false,
});

const Navbar = dynamic(() => import("./Navbar"), { ssr: false });

function AppShellContent({ children }: AppShellProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isNavigationExiting, setIsNavigationExiting] = useState(false);
  const hasDispatchedRevealRef = useRef(false);
  const navigationScrollRef = useRef(0);
  const isContentVisible = !showPreloader;
  const { app, isSceneActive } = useThreeApp();

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

    const handleNavigationStart = () => {
      navigationScrollRef.current = window.scrollY || 0;
      setIsNavigationExiting(true);
    };

    const handleNavigationEnd = () => {
      setIsNavigationExiting(false);
      navigationScrollRef.current = 0;
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let animationFrame: number | undefined;

    const syncState = (state: Readonly<ThreeAppState>) => {
      updateStoredSceneState({
        variantName: state.variantName,
        variant: state.variant,
        shapeOpacity: state.shapeOpacity,
        opacity: state.opacity,
      });
    };

    const handleStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ state: Readonly<ThreeAppState> }>;
      if (!customEvent.detail?.state) {
        return;
      }

      syncState(customEvent.detail.state);
    };

    const attach = () => {
      if (!app) {
        animationFrame = window.requestAnimationFrame(attach);
        return;
      }

      const snapshot = app.bundle.getState();
      if (hasStoredSceneState()) {
        applyStoredSceneState(app, getStoredSceneState());
      } else {
        syncState(snapshot);
      }
      app.bundle.events.addEventListener("statechange", handleStateChange);
    };

    attach();

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (app) {
        app.bundle.events.removeEventListener("statechange", handleStateChange);
      }
    };
  }, [app]);

  const contentClassName = [
    isContentVisible ? "" : "pointer-events-none opacity-0",
    isNavigationExiting ? "pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const exitStyle = isNavigationExiting
    ? {
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        position: "fixed" as const,
        top: `-${navigationScrollRef.current}px`,
        left: 0,
        right: 0,
        height: "100%",
        width: "100%",
      }
    : undefined;

  return (
    <MenuProvider>
      <div className="app-shell relative min-h-screen w-full">
        {showPreloader && <Preloader onComplete={handleComplete} />}
        {isSceneActive ? <CanvasRoot isReady={isReady} /> : null}
        <RoutePrefetcher routes={ROUTES_TO_PREFETCH} />
        <div
          className={contentClassName}
          style={exitStyle}
          data-navigation-exiting={isNavigationExiting ? "true" : undefined}
          aria-hidden={!isContentVisible}
          aria-busy={!isContentVisible || isNavigationExiting}
        >
          <Navbar />
          {children}
        </div>
      </div>
    </MenuProvider>
  );
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <ThreeAppProvider>
      <AppShellContent>{children}</AppShellContent>
    </ThreeAppProvider>
  );
}
