"use client";

import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/app/theme/ThemeContext";
import { useThreeApp } from "@/app/helpers/threeAppContext";
import type { ThreeAppHandle } from "./types";
import { useAnimationQuality } from "@/components/AnimationQualityContext";
import { logPerf, shouldLogPerf } from "@/app/helpers/perfDebug";

interface CoreCanvasProps {
  isReady: boolean;
}

let persistentCanvas: HTMLCanvasElement | null = null;
let persistentHandle: ThreeAppHandle | null = null;
let persistentInitPromise: Promise<ThreeAppHandle> | null = null;

export default function CoreCanvas({ isReady }: CoreCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shouldStart, setShouldStart] = useState(false);
  const { theme } = useTheme();
  const { resolvedQuality } = useAnimationQuality();
  const { setApp } = useThreeApp();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (resolvedQuality === "high") {
      const schedule =
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback
          : (callback: IdleRequestCallback) =>
              window.setTimeout(
                () => callback({ didTimeout: false, timeRemaining: () => 0 }),
                800,
              );

      const handle = schedule(() => setShouldStart(true));

      return () => {
        if (
          typeof window.cancelIdleCallback === "function" &&
          typeof handle === "number"
        ) {
          window.cancelIdleCallback(handle);
        } else if (typeof handle === "number") {
          window.clearTimeout(handle);
        }
      };
    }

    const handleInteraction = () => setShouldStart(true);
    const fallbackStart = window.setTimeout(() => setShouldStart(true), 400);
    window.addEventListener("pointerdown", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.clearTimeout(fallbackStart);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [resolvedQuality]);

  useEffect(() => {
    if (!shouldStart || !isReady) {
      return;
    }

    const host = hostRef.current;
    if (!host) {
      return;
    }

    if (!persistentCanvas) {
      persistentCanvas = document.createElement("canvas");
      persistentCanvas.className = "h-full w-full";
      persistentCanvas.setAttribute("aria-hidden", "true");
      persistentCanvas.dataset.threeCanvas = "true";
    }

    if (!host.contains(persistentCanvas)) {
      host.appendChild(persistentCanvas);
    }

    if (persistentHandle) {
      setApp(persistentHandle);
      return;
    }

    if (!persistentInitPromise && shouldLogPerf()) {
      performance.mark("three:init-start");
      logPerf("3D scene init started.", {
        timeMs: Math.round(performance.now()),
      });
    }

    if (!persistentInitPromise) {
      persistentInitPromise = import("./sceneBundle")
        .then(({ default: initScene }) =>
          initScene({ canvas: persistentCanvas as HTMLCanvasElement, theme }),
        )
        .then((handle) => {
          persistentHandle = handle;
          return handle;
        });
    }

    void persistentInitPromise.then((handle) => {
      setApp(handle);
    });

    return () => {
      if (
        hostRef.current &&
        persistentCanvas &&
        hostRef.current.contains(persistentCanvas)
      ) {
        hostRef.current.removeChild(persistentCanvas);
      }
    };
  }, [shouldStart, isReady, setApp]);

  useEffect(() => {
    if (!persistentHandle) return;
    persistentHandle.setState({ theme });
  }, [theme]);

  return <div ref={hostRef} className="h-full w-full" aria-hidden />;
}
