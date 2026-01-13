"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Menu from "./Menu";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "react-i18next";
import "../app/i18n/config";
import { useReducedMotion } from "framer-motion";
import {
  FALL_ITEM_STAGGER_DELAY,
  FALL_ITEM_TRANSITION_DURATION,
  getFallItemStyle,
} from "./fallAnimation";
import { useMenu } from "./MenuContext";
import {
  MENU_OVERLAY_MONOGRAM,
  createResponsiveHeroVariantState,
  createVariantState,
  type PointerDriver,
  type PointerTarget,
  type ShapeOpacityState,
  type VariantState,
} from "@/components/three/types";

const APP_SHELL_REVEAL_EVENT = "app-shell:reveal";
const MENU_MOBILE_BREAKPOINT = 1500;

type StoredSceneState = {
  variant: VariantState;
  parallax: boolean;
  hovered: boolean;
  cursorBoost: number;
  pointerDriver: PointerDriver;
  manualPointer: PointerTarget;
  shapeOpacity: ShapeOpacityState;
  opacity: number;
};

export default function Navbar() {
  const { isOpen, setIsOpen } = useMenu();
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoverHold, setHoverHold] = useState(false);
  const animTimerRef = useRef<number | undefined>(undefined);
  const navigationTimeoutRef = useRef<number | undefined>(undefined);
  const isNavigatingRef = useRef(false);
  const hasAnnouncedMenuStateRef = useRef(false);
  const storedSceneStateRef = useRef<StoredSceneState | null>(null);
  const [menuSceneVersion, setMenuSceneVersion] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    isNavigatingRef.current = false;
    if (navigationTimeoutRef.current) {
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = undefined;
    }
  }, [pathname]);
  useEffect(() => {
    const body = document.body;
    if (!body) {
      return;
    }

    if (isOpen) {
      body.dataset.menuOpen = "true";
    } else {
      delete body.dataset.menuOpen;
    }

    return () => {
      delete body.dataset.menuOpen;
    };
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const app = window.__THREE_APP__;
    if (!app) {
      const frame = window.requestAnimationFrame(() => {
        setMenuSceneVersion((value) => value + 1);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    const computeMenuVariant = () =>
      createResponsiveHeroVariantState(
        MENU_OVERLAY_MONOGRAM,
        window.innerWidth,
        window.innerHeight,
        MENU_MOBILE_BREAKPOINT,
        MENU_MOBILE_BREAKPOINT,
      );

    const applyMenuVariant = () => {
      app.setState({ variant: computeMenuVariant() });
    };

    const snapshot = app.bundle.getState();
    storedSceneStateRef.current = {
      variant: createVariantState(snapshot.variant),
      parallax: snapshot.parallax,
      hovered: snapshot.hovered,
      cursorBoost: snapshot.cursorBoost,
      pointerDriver: snapshot.pointerDriver,
      manualPointer: { ...snapshot.manualPointer },
      shapeOpacity: { ...snapshot.shapeOpacity },
      opacity: snapshot.opacity,
    };

    const initialMenuVariant = computeMenuVariant();

    app.setState({
      parallax: false,
      hovered: false,
      cursorBoost: 0,
      pointerDriver: "manual",
      manualPointer: { x: 0, y: 0 },
      variant: initialMenuVariant,
      shapeOpacity: { ...snapshot.shapeOpacity },
      opacity: snapshot.opacity,
    });

    window.addEventListener("resize", applyMenuVariant);

    return () => {
      window.removeEventListener("resize", applyMenuVariant);

      const stored = storedSceneStateRef.current;
      if (stored) {
        app.setState({
          parallax: stored.parallax,
          hovered: stored.hovered,
          cursorBoost: stored.cursorBoost,
          pointerDriver: stored.pointerDriver,
          manualPointer: { ...stored.manualPointer },
          variant: createVariantState(stored.variant),
          shapeOpacity: { ...stored.shapeOpacity },
          opacity: stored.opacity,
        });
        storedSceneStateRef.current = null;
      }
    };
  }, [isOpen, menuSceneVersion]);
  const { t } = useTranslation("common");
  const prefersReducedMotion = useReducedMotion();
  const disableFallAnimation = Boolean(prefersReducedMotion);
  const [isFallActive, setIsFallActive] = useState(disableFallAnimation);
  const controlsHideTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (disableFallAnimation) {
      setIsFallActive(true);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const activateFall = () => {
      setIsFallActive(true);
      window.removeEventListener(APP_SHELL_REVEAL_EVENT, activateFall);
    };

    if (typeof document !== "undefined" && document.body?.dataset.preloading === "false") {
      activateFall();
      return;
    }

    window.addEventListener(APP_SHELL_REVEAL_EVENT, activateFall);

    return () => {
      window.removeEventListener(APP_SHELL_REVEAL_EVENT, activateFall);
    };
  }, [disableFallAnimation]);

  const totalFallItems = 4;
  const navigationFallItems = 6;
  const totalControlItems = 2;
  const navigationFallDuration =
    FALL_ITEM_TRANSITION_DURATION +
    Math.max(navigationFallItems - 1, 0) * FALL_ITEM_STAGGER_DELAY;
  const fallStyle = (index: number) =>
    getFallItemStyle(isFallActive, index, totalFallItems, {
      disable: disableFallAnimation,
    });
  const controlFallStyle = (index: number, isActive: boolean) =>
    getFallItemStyle(isActive, index, totalControlItems, {
      disable: disableFallAnimation,
    });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!hasAnnouncedMenuStateRef.current) {
      hasAnnouncedMenuStateRef.current = true;

      if (!isOpen) {
        return;
      }
    }

    const eventName = isOpen ? "app-menu:open" : "app-menu:close";
    window.dispatchEvent(new CustomEvent(eventName));
  }, [isOpen]);

  const isHome = pathname === "/";
  const shouldShowControls = isOpen || isHome;
  const [areControlsVisible, setAreControlsVisible] = useState(shouldShowControls);

  useEffect(() => {
    if (controlsHideTimeoutRef.current) {
      window.clearTimeout(controlsHideTimeoutRef.current);
      controlsHideTimeoutRef.current = undefined;
    }

    if (shouldShowControls) {
      setAreControlsVisible(true);
      return;
    }

    const totalDelay =
      FALL_ITEM_TRANSITION_DURATION +
      Math.max(totalControlItems - 1, 0) * FALL_ITEM_STAGGER_DELAY;

    controlsHideTimeoutRef.current = window.setTimeout(() => {
      setAreControlsVisible(false);
    }, totalDelay);

    return () => {
      if (controlsHideTimeoutRef.current) {
        window.clearTimeout(controlsHideTimeoutRef.current);
        controlsHideTimeoutRef.current = undefined;
      }
    };
  }, [shouldShowControls, totalControlItems]);

  function handleToggle() {
    setIsAnimating(true);
    setHoverHold(true); // <- trava hover no clique
    setIsOpen((v) => !v);

    if (animTimerRef.current) window.clearTimeout(animTimerRef.current);
    animTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
    }, 420);
  }

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
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

    if (disableFallAnimation || pathname === "/") {
      return;
    }

    event.preventDefault();

    if (isNavigatingRef.current) {
      return;
    }

    isNavigatingRef.current = true;
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("app-navigation:start"));

    navigationTimeoutRef.current = window.setTimeout(() => {
      router.push("/");
    }, navigationFallDuration);
  };

  return (
    <>
      <header>
        <div className="header-content">
          {/* LEFT */}
          <div className="left-part flex transform-none">
            <div className="logo" style={fallStyle(0)}>
              <Link href="/" aria-label="Home" onClick={handleLogoClick}>
                <span className="visually-hidden">Home</span>
                <svg
                  data-name="deconstructedLogo"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 474 358"
                  width="60"
                  height="60"
                  className="icons-style"
                  
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path 
                  d="M152.983 347C94.2985 347 45.7051 306.564 37.2766 253.839C35.6219 243.488 40.2441 233.389 47.788 226.11C62.4297 211.983 85.5198 211.637 100.578 225.32L101.091 225.786C109.302 233.246 112.941 244.471 118.29 254.19C124.764 265.954 137.869 274 152.983 274C168.542 274 181.972 265.473 188.231 253.14C192.928 243.885 196.174 233.414 203.605 226.169C218.129 212.01 241.147 211.551 256.224 225.119L256.912 225.737C265.232 233.225 270.39 243.973 268.496 255.005C259.543 307.159 211.234 347 152.983 347Z" 
                  strokeWidth={11}/>
                  <path 
                  d="M163.986 5C80.3013 5 13.5034 64.6834 5.21662 142.296C3.67664 156.72 10.532 170.78 21.2954 181.06C43.0688 201.856 76.7407 202.361 97.4656 182.201L98.1532 181.532C108.996 170.985 113.357 155.459 119.756 141.684C128.01 123.913 146.431 111.667 168.317 111.667C198.877 111.667 224.621 135.545 225.817 165C226.719 187.199 213.419 206.231 193.73 214.26C180.991 219.455 167.216 223.84 157.616 233.57C136.876 254.591 138.307 289.474 160.955 310.279C171.241 319.728 184.697 325.373 198.219 323.696C279.435 313.623 339.792 246.413 336.486 165C332.897 76.6344 255.666 5 163.986 5Z"
                  strokeWidth={11} />
                  <g transform="matrix(0.989521 -0.14439 -0.169429 -0.985543 368.986 356.854)"
                  strokeWidth={11}>
                    <rect 
                    width="69.1299" 
                    height="230.201" 
                    rx="34.565"
                    strokeWidth={11} />
                  </g>
                  <path 
                  d="M362.378 156.771C321.716 168.224 294.73 199.608 295.996 230.915C296.349 239.662 303.271 246.532 311.604 249.871C323.934 254.812 337.872 251.102 345.591 240.827L345.902 240.413C351.42 233.067 351.926 222.676 356.125 214.511C359.572 207.808 366.715 202.08 375.995 199.466C385.686 196.737 395.417 198.048 402.282 202.281C409.85 206.949 415.731 214.838 423.966 218.185C436.225 223.166 450.131 219.537 457.87 209.337L458.287 208.787C463.891 201.402 465.954 191.43 460.655 183.53C443.077 157.321 402.608 145.439 362.378 156.771Z"
                  strokeWidth={11} />
                  <circle 
                  cx="170.984" 
                  cy="165" 
                  r="34"
                  strokeWidth={11} />
                </svg>
              </Link>
            </div>

            <h5
              className="full-identity"
              style={{
                display: "none",
                transform: "translateY(-100px) translateZ(0px)",
              }}
            >
              <span className="nickname">Duartois</span>/
              <span className="fullname">Matheus Duarte</span>
            </h5>
          </div>

          {/* RIGHT */}
          <div className="right-part" style={{ display: "flex", transform: "none" }}>
            <ul>
              {/* LanguageSwitcher no lugar do EN/PT estático */}
              <li
                className="language-switch flex transform-none"
                style={{
                  ...controlFallStyle(0, shouldShowControls),
                  display: areControlsVisible ? "block" : "none",
                  pointerEvents: shouldShowControls ? "auto" : "none",
                }}
              >
                <LanguageSwitcher />
              </li>

              {/* ThemeToggle usando o mesmo ícone (lua/sol) da referência */}
              <li
                className="theme-switch"
                style={{
                  ...controlFallStyle(1, shouldShowControls),
                  display: areControlsVisible ? "block" : "none",
                  pointerEvents: shouldShowControls ? "auto" : "none",
                }}
              >
                <ThemeToggle />
              </li>

              {/* Botão do menu (9 pontos) */}
              <li style={fallStyle(3)}>
                <button
                  className="hamburger-btn"
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={isOpen}
                  aria-controls="main-navigation-overlay"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  data-open={isOpen}
                  data-animating={isAnimating}
                  data-hover-hold={hoverHold}
                  onClick={handleToggle}
                  onMouseLeave={() => setHoverHold(false)}
                  onBlur={() => setHoverHold(false)}
                >
                  <div style={{ transform: "none" }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="48"
                      height="48"
                      className="icons-style menu-icon"
                      aria-hidden="true"
                    >
                      <title>Menu</title>

                      {/* linha de cima */}
                      <circle cx="12" cy="12" r="3" className="dot dot-12-12" />
                      <circle cx="24" cy="12" r="3" className="dot dot-24-12" />
                      <circle cx="36" cy="12" r="3" className="dot dot-36-12" />

                      {/* meio (os lados são círculos, o centro é quadrado arredondado) */}
                      <circle cx="12" cy="24" r="3" className="dot dot-12-24" />
                      <circle cx="36" cy="24" r="3" className="dot dot-36-24" />

                      {/* linha de baixo */}
                      <circle cx="12" cy="36" r="3" className="dot dot-12-36" />
                      <circle cx="24" cy="36" r="3" className="dot dot-24-36" />
                      <circle cx="36" cy="36" r="3" className="dot dot-36-36" />
                      <g className="center-bars">
                        <rect
                          x="21"
                          y="21"
                          width="6"
                          height="6"
                          rx="3"
                          ry="3"
                          opacity="0.75"
                          className="dot-center-w"
                        />
                        <rect
                          x="21"
                          y="21"
                          width="6"
                          height="6"
                          rx="3"
                          ry="3"
                          opacity="0.75"
                          className="dot-center-h"
                        />
                      </g>
                    </svg>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <Menu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
