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

const resolveQuality = (quality: AnimationQuality): ResolvedAnimationQuality => {
  if (typeof window === "undefined") {
    return quality === "low" ? "low" : "high";
  }

  if (quality === "high" || quality === "low") {
    return quality;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const connection =
    (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection ?? {};
  const effectiveType = connection.effectiveType ?? "";
  const saveData = Boolean(connection.saveData);
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 0;
  const isLowEndDevice =
    (deviceMemory !== undefined && deviceMemory <= 4) ||
    (hardwareConcurrency !== 0 && hardwareConcurrency <= 4);
  const isSlowConnection =
    saveData || effectiveType.includes("2g") || effectiveType.includes("3g");
  const isHidden = document.hidden;

  return prefersReducedMotion || isLowEndDevice || isSlowConnection || isHidden
    ? "low"
    : "high";
};

export function AnimationQualityProvider({ children }: { children: ReactNode }) {
  const [quality, setQualityState] = useState<AnimationQuality>(DEFAULT_QUALITY);
  const [resolvedQuality, setResolvedQuality] =
    useState<ResolvedAnimationQuality>("high");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as
      | AnimationQuality
      | null;

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
