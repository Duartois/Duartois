"use client";

import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/app/theme/ThemeContext";
import { initScene } from "./initScene";
import type { ThreeAppHandle } from "./types";
import { useAnimationQuality } from "@/components/AnimationQualityContext";
import { logPerf, isPerfDebugEnabled } from "@/app/helpers/perfDebug";

interface CoreCanvasProps {
  isReady: boolean;
}

export default function CoreCanvas({ isReady }: CoreCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<ThreeAppHandle | null>(null);
  const initializedRef = useRef(false);
  const [shouldStart, setShouldStart] = useState(false);
  const { theme } = useTheme();
  const { resolvedQuality } = useAnimationQuality();

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
    window.addEventListener("pointerdown", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [resolvedQuality]);

  useEffect(() => {
    if (!shouldStart || !isReady || initializedRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    initializedRef.current = true;
    let cancelled = false;

    if (isPerfDebugEnabled) {
      performance.mark("three:init-start");
      logPerf("3D scene init started.", { timeMs: Math.round(performance.now()) });
    }

    void initScene({ canvas, theme }).then((handle) => {
      if (cancelled) {
        handle.dispose();
        return;
      }
      handleRef.current = handle;
    });

    return () => {
      cancelled = true;
      initializedRef.current = false;
      if (handleRef.current) {
        handleRef.current.dispose();
        handleRef.current = null;
      }
    };
  }, [shouldStart, theme, isReady]);

  useEffect(() => {
    if (!handleRef.current) return;
    handleRef.current.setState({ theme });
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-hidden
      data-three-canvas
    />
  );
}
