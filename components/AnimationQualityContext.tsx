"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSafari, isIOS, isLowPowerDevice } from "@/app/helpers/runtime";

export type AnimationQuality = "auto" | "high" | "low";
export type ResolvedAnimationQuality = "high" | "low";

type AnimationQualityState = {
  quality: AnimationQuality;
  resolvedQuality: ResolvedAnimationQuality;
  setQuality: (quality: AnimationQuality) => void;
};

const STORAGE_KEY = "duartois:animation-quality";
const DEFAULT_QUALITY =
  (process.env.NEXT_PUBLIC_ANIMATION_QUALITY as AnimationQuality | undefined) ??
  "auto";

const AnimationQualityContext = createContext<AnimationQualityState>({
  quality: DEFAULT_QUALITY,
  resolvedQuality: "high",
  setQuality: () => undefined,
});

/**
 * Resolve the effective animation quality from explicit user preference or
 * device/OS signals.
 *
 * Detection hierarchy (first match wins):
 *  1. Explicit user choice ("high" / "low") → honour as-is
 *  2. `prefers-reduced-motion: reduce`       → low
 *  3. iOS device                             → low  (tight memory / thermal budget)
 *  4. Safari on desktop                      → depends on hardware signals below
 *  5. Slow network / save-data               → low
 *  6. Low hardware (memory ≤ 2 GB or 2 cores)→ low
 *  7. Document hidden                        → low  (no point animating)
 *  8. Fallback                               → high
 *
 * NOTE: iOS devices always resolve to "low" regardless of hardware specs because:
 *   - iOS 16+ imposes a 1 GB WebGL heap limit per page
 *   - Safari on iOS pauses JS timers in background tabs aggressively
 *   - Thermal throttling on iPhone causes visible frame drops after ~60 s
 */
const resolveQuality = (
  quality: AnimationQuality,
): ResolvedAnimationQuality => {
  if (typeof window === "undefined") {
    return quality === "low" ? "low" : "high";
  }

  if (quality === "high" || quality === "low") {
    return quality;
  }

  // 1. prefers-reduced-motion + low hardware + slow network
  if (isLowPowerDevice()) return "low";

  // 2. iOS Safari — always low (memory / thermal constraints)
  if (isIOS()) return "low";

  // 3. Desktop Safari with moderate hardware — additional check
  if (isSafari()) {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const deviceMemory = nav.deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 0;

    const isMidRangeSafari =
      (deviceMemory !== undefined && deviceMemory <= 8) ||
      (hardwareConcurrency > 0 && hardwareConcurrency <= 4);

    if (isMidRangeSafari) return "low";
  }

  const connection =
    (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection ?? {};
  const effectiveType = connection.effectiveType ?? "";
  const saveData = Boolean(connection.saveData);
  const isSlowConnection =
    saveData || effectiveType.includes("2g") || effectiveType.includes("3g");

  const isHidden = document.hidden;

  return isSlowConnection || isHidden ? "low" : "high";
};

export function AnimationQualityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [quality, setQualityState] =
    useState<AnimationQuality>(DEFAULT_QUALITY);
  const [resolvedQuality, setResolvedQuality] =
    useState<ResolvedAnimationQuality>("high");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(
      STORAGE_KEY,
    ) as AnimationQuality | null;

    if (stored === "auto" || stored === "high" || stored === "low") {
      setQualityState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setResolvedQuality(resolveQuality(quality));

    const handleUpdate = () => {
      setResolvedQuality(resolveQuality(quality));
    };

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    reducedMotionQuery.addEventListener("change", handleUpdate);
    document.addEventListener("visibilitychange", handleUpdate);
    window.addEventListener("online", handleUpdate);

    return () => {
      reducedMotionQuery.removeEventListener("change", handleUpdate);
      document.removeEventListener("visibilitychange", handleUpdate);
      window.removeEventListener("online", handleUpdate);
    };
  }, [quality]);

  const setQuality = useCallback((nextQuality: AnimationQuality) => {
    setQualityState(nextQuality);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextQuality);
    }
  }, []);

  const value = useMemo(
    () => ({
      quality,
      resolvedQuality,
      setQuality,
    }),
    [quality, resolvedQuality, setQuality],
  );

  return (
    <AnimationQualityContext.Provider value={value}>
      {children}
    </AnimationQualityContext.Provider>
  );
}

export const useAnimationQuality = () => useContext(AnimationQualityContext);
