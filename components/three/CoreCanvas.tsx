"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "@/app/theme/ThemeContext";
import { initScene } from "./initScene";
import type { ThreeAppHandle } from "./types";

export default function CoreCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<ThreeAppHandle | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let cancelled = false;

    void initScene({ canvas, theme }).then((handle) => {
      if (cancelled) {
        handle.dispose();
        return;
      }
      handleRef.current = handle;
    });

    return () => {
      cancelled = true;
      if (handleRef.current) {
        handleRef.current.dispose();
        handleRef.current = null;
      }
    };
  }, []);

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
