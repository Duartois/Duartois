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
import { ThreeAppProvider } from "@/app/helpers/threeAppContext";

interface AppShellProps {
  children: ReactNode;
}

const ROUTES_TO_PREFETCH = ["/work", "/about", "/contact"] as const;

// Tempo extra (ms) para aguardar a nova página iniciar suas animações
// de entrada antes de soltar o fixed container.
// Deve ser >= ao tempo de stagger dos primeiros itens da nova página.
const NAVIGATION_EXIT_RELEASE_DELAY = 80;

const GlobalCanvas = dynamic(() => import("./three/GlobalCanvas"), {
  ssr: false,
});

const Navbar = dynamic(() => import("./Navbar"), { ssr: false });

function AppShellContent({ children }: AppShellProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isNavigationExiting, setIsNavigationExiting] = useState(false);
  // Mantém opacity:0 durante o delay entre saída e entrada para suprimir o vislumbre dos elementos antigos
  const [isNavigationReleasing, setIsNavigationReleasing] = useState(false);
  const hasDispatchedRevealRef = useRef(false);
  const navigationScrollRef = useRef(0);
  const navigationEndTimerRef = useRef<number | undefined>(undefined);
  const isContentVisible = !showPreloader;

  const handleComplete = useCallback(() => {
    setIsReady(true);
    setShowPreloader(false);
  }, []);

  useEffect(() => {
    const body = document.body;
    if (!body) return;

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

  // Lógica de navegação com saída suave
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNavigationClick = (event: MouseEvent) => {
      if (showPreloader) return;
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) return;

      const target = event.target as Element | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      if (anchor.hasAttribute(EXIT_NAVIGATION_ATTRIBUTE)) return;
      if (anchor.hasAttribute("download")) return;

      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const currentUrl = new URL(window.location.href);
      if (
        url.pathname === currentUrl.pathname &&
        url.search === currentUrl.search &&
        url.hash === currentUrl.hash
      ) return;

      event.preventDefault();
      navigateWithExit(router, `${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("click", handleNavigationClick, true);
    return () => document.removeEventListener("click", handleNavigationClick, true);
  }, [router, showPreloader]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNavigationStart = () => {
      // Cancela qualquer timer de release pendente
      if (navigationEndTimerRef.current) {
        window.clearTimeout(navigationEndTimerRef.current);
        navigationEndTimerRef.current = undefined;
      }
      navigationScrollRef.current = window.scrollY || 0;
      setIsNavigationExiting(true);
    };

    const handleNavigationEnd = () => {
      if (navigationEndTimerRef.current) {
        window.clearTimeout(navigationEndTimerRef.current);
      }

      // Fase 1: sai do fixed (nova página monta no fluxo normal) mas permanece
      // invisível via isNavigationReleasing — isso suprime o vislumbre dos
      // elementos "a" que ressurgiriam ao sair do position:fixed.
      setIsNavigationExiting(false);
      setIsNavigationReleasing(true);
      navigationScrollRef.current = 0;

      // Fase 2: após a nova página ter montado e iniciado suas animações de
      // entrada, remove o opacity:0 e deixa o useMenuFallAnimation assumir.
      navigationEndTimerRef.current = window.setTimeout(() => {
        setIsNavigationReleasing(false);
        navigationEndTimerRef.current = undefined;
      }, NAVIGATION_EXIT_RELEASE_DELAY);
    };

    window.addEventListener(APP_NAVIGATION_START_EVENT, handleNavigationStart);
    window.addEventListener(APP_NAVIGATION_END_EVENT, handleNavigationEnd);

    return () => {
      window.removeEventListener(APP_NAVIGATION_START_EVENT, handleNavigationStart);
      window.removeEventListener(APP_NAVIGATION_END_EVENT, handleNavigationEnd);
      if (navigationEndTimerRef.current) {
        window.clearTimeout(navigationEndTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    if (!body) return;

    if (isNavigationExiting) {
      body.dataset.navigationExiting = "true";
      return;
    }

    delete body.dataset.navigationExiting;
  }, [isNavigationExiting]);

  const contentClassName = [
    isContentVisible ? "" : "pointer-events-none opacity-0",
    isNavigationExiting || isNavigationReleasing ? "pointer-events-none" : "",
    isNavigationReleasing ? "opacity-0" : "",
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
        <GlobalCanvas isReady={isReady} />
        <RoutePrefetcher routes={ROUTES_TO_PREFETCH} />
        <div
          className={contentClassName}
          style={exitStyle}
          data-navigation-exiting={isNavigationExiting ? "true" : undefined}
          aria-hidden={!isContentVisible}
          aria-busy={!isContentVisible || isNavigationExiting || isNavigationReleasing}
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
