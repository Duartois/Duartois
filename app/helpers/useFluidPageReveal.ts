"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

const APP_NAVIGATION_START_EVENT = "app-navigation:start";

export function useFluidPageReveal(delay = 0): CSSProperties {
  const prefersReducedMotion = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    let frame: number;
    let timeout: number | undefined;

    frame = requestAnimationFrame(() => {
      if (delay > 0) {
        timeout = window.setTimeout(() => {
          setIsRevealed(true);
        }, delay);
      } else {
        setIsRevealed(true);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      if (typeof timeout === "number") {
        window.clearTimeout(timeout);
      }
    };
  }, [delay, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const handleNavigationStart = () => {
      setIsRevealed(false);
    };

    window.addEventListener(APP_NAVIGATION_START_EVENT, handleNavigationStart);

    return () => {
      window.removeEventListener(
        APP_NAVIGATION_START_EVENT,
        handleNavigationStart,
      );
    };
  }, [prefersReducedMotion]);

  return useMemo(() => {
    if (prefersReducedMotion) {
      return {
        transform: "none",
        transition: "none",
      } satisfies CSSProperties;
    }

    const transition = "transform 680ms cubic-bezier(0.16, 1, 0.3, 1)";

    return {
      transform: isRevealed
        ? "translate3d(0, 0, 0)"
        : "translate3d(0, 40px, 0)",
      transition,
      transitionDelay: delay > 0 ? `${delay}ms` : undefined,
      willChange: "transform",
    } satisfies CSSProperties;
  }, [delay, isRevealed, prefersReducedMotion]);
}
