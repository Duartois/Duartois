"use client";

import { Suspense, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useProgress } from "@react-three/drei";
import type { VariantState } from "../store/variants";

const ProceduralPreview = dynamic(() => import("./three/ProceduralCanvas"), {
  ssr: false,
  loading: () => <div className="h-48 w-48 animate-pulse rounded-full bg-fg/10" />,
});

const PRELOADER_VARIANT: VariantState = {
  cTop: {
    position: [-1.3, 1.15, 0.12],
    rotation: [0.32, -0.18, 1.38],
  },
  cBottom: {
    position: [-1.05, -1.2, -0.08],
    rotation: [-0.38, 0.16, -1.24],
  },
  sShape: {
    position: [0.8, 0.45, 0.04],
    rotation: [0.08, 0.28, -0.18],
  },
  dot: {
    position: [2.25, -0.35, 0.08],
    rotation: [0.28, -0.08, 0.56],
  },
};

const PRELOADER_PALETTE = [
  { colorA: "#f8f5ff", colorB: "#ceb5ff" },
  { colorA: "#ffeaf5", colorB: "#ff9fcf" },
  { colorA: "#dffdf7", colorB: "#65ded1" },
  { colorA: "#f3ffe3", colorB: "#baf775" },
];

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const { progress, active } = useProgress();
  const hasCompletedRef = useRef(false);
  const formattedProgress = Math.round(progress);

  useEffect(() => {
    if (!active && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete?.();
    }
  }, [active, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg/95 backdrop-blur"
      role="status"
      aria-live="polite"
    >
      <Suspense fallback={<div className="h-48 w-48 animate-pulse rounded-full bg-fg/10" />}> 
        <div className="pointer-events-none"> 
          <ProceduralPreview
            className="h-48 w-48"
            variantOverride={PRELOADER_VARIANT}
            palette={PRELOADER_PALETTE}
            parallax={false}
            dpr={[1, 1.5]}
          />
        </div>
      </Suspense>
      <div className="text-center text-fg">
        <p className="text-lg font-semibold tracking-wide">Materializing shapes…</p>
        <p className="mt-1 text-sm font-medium text-fg/70">{formattedProgress}%</p>
      </div>
    </div>
  );
}
