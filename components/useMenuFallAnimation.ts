"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { getFallItemStyle } from "./fallAnimation";
import { useAnimationQuality } from "./AnimationQualityContext";

const APP_SHELL_REVEAL_EVENT = "app-shell:reveal";
const APP_MENU_OPEN_EVENT = "app-menu:open";
const APP_MENU_CLOSE_EVENT = "app-menu:close";
const APP_NAVIGATION_START_EVENT = "app-navigation:start";
const APP_NAVIGATION_END_EVENT = "app-navigation:end";

export function useMenuFallAnimation(
  totalItems: number,
  options?: { variant?: "default" | "work" },
) {
  const prefersReducedMotion = useReducedMotion();
  const { resolvedQuality } = useAnimationQuality();
  const disableFallAnimation = Boolean(
    prefersReducedMotion || resolvedQuality === "low",
  );
  const [isFallActive, setIsFallActive] = useState(disableFallAnimation);
  const isNavigatingAwayRef = useRef(false);

  useEffect(() => {
    if (disableFallAnimation) {
      setIsFallActive(true);
      isNavigatingAwayRef.current = false;
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const activateFall = () => {
      setIsFallActive(true);
      isNavigatingAwayRef.current = false;
      window.removeEventListener(APP_SHELL_REVEAL_EVENT, activateFall);
    };

    if (
      typeof document !== "undefined" &&
      document.body?.dataset.preloading !== "true"
    ) {
      activateFall();
      return;
    }

    window.addEventListener(APP_SHELL_REVEAL_EVENT, activateFall);

    return () => {
      window.removeEventListener(APP_SHELL_REVEAL_EVENT, activateFall);
    };
  }, [disableFallAnimation]);

  useEffect(() => {
    if (disableFallAnimation) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const handleMenuOpen = () => {
      setIsFallActive(false);
    };

    const handleMenuClose = () => {
      if (isNavigatingAwayRef.current) {
        return;
      }

      setIsFallActive(true);
    };

    const handleNavigationStart = () => {
      isNavigatingAwayRef.current = true;
      setIsFallActive(false);
    };

    const handleNavigationEnd = () => {
      isNavigatingAwayRef.current = false;
      setIsFallActive(true);
    };

    window.addEventListener(APP_MENU_OPEN_EVENT, handleMenuOpen);
    window.addEventListener(APP_MENU_CLOSE_EVENT, handleMenuClose);
    window.addEventListener(APP_NAVIGATION_START_EVENT, handleNavigationStart);
    window.addEventListener(APP_NAVIGATION_END_EVENT, handleNavigationEnd);

    return () => {
      window.removeEventListener(APP_MENU_OPEN_EVENT, handleMenuOpen);
      window.removeEventListener(APP_MENU_CLOSE_EVENT, handleMenuClose);
      window.removeEventListener(
        APP_NAVIGATION_START_EVENT,
        handleNavigationStart,
      );
      window.removeEventListener(
        APP_NAVIGATION_END_EVENT,
        handleNavigationEnd,
      );
    };
  }, [disableFallAnimation]);

  return useCallback(
    (index: number) =>
      getFallItemStyle(isFallActive, index, totalItems, {
        disable: disableFallAnimation,
        variant: options?.variant,
      }),
    [disableFallAnimation, isFallActive, options?.variant, totalItems],
  );
}
