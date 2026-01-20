"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

import { useAnimationQuality } from "@/components/AnimationQualityContext";

const APP_NAVIGATION_START_EVENT = "app-navigation:start";

export function useFluidPageReveal(delay = 0): CSSProperties {
  const prefersReducedMotion = useReducedMotion();
  const { resolvedQuality } = useAnimationQuality();
  const disableAnimation =
    prefersReducedMotion || resolvedQuality === "low";
  const [isRevealed, setIsRevealed] = useState(disableAnimation);

  useEffect(() => {
    if (disableAnimation) {
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
  }, [delay, disableAnimation]);

  useEffect(() => {
    if (disableAnimation) {
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
  }, [disableAnimation]);

  return useMemo(() => {
    if (disableAnimation) {
      return {
        transform: "none",
        opacity: 1,
        transition: "none",
      } satisfies CSSProperties;
    }

    const transformTransition =
      "transform 680ms cubic-bezier(0.16, 1, 0.3, 1)";
    const opacityTransition =
      "opacity 480ms cubic-bezier(0.16, 1, 0.3, 1)";

    return {
      transform: isRevealed
        ? "translate3d(0, 0, 0)"
        : "translate3d(0, 40px, 0)",
      opacity: isRevealed ? 1 : 0,
      transition: `${transformTransition}, ${opacityTransition}`,
      transitionDelay: delay > 0 ? `${delay}ms` : undefined,
      willChange: isRevealed ? "auto" : "transform, opacity",
    } satisfies CSSProperties;
  }, [delay, isRevealed, disableAnimation]);
}
