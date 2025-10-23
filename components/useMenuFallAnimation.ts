"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { getFallItemStyle } from "./fallAnimation";

const APP_SHELL_REVEAL_EVENT = "app-shell:reveal";

export function useMenuFallAnimation(totalItems: number) {
  const prefersReducedMotion = useReducedMotion();
  const disableFallAnimation = Boolean(prefersReducedMotion);
  const [isFallActive, setIsFallActive] = useState(disableFallAnimation);

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

  return useCallback(
    (index: number) =>
      getFallItemStyle(isFallActive, index, totalItems, {
        disable: disableFallAnimation,
      }),
    [disableFallAnimation, isFallActive, totalItems],
  );
}
