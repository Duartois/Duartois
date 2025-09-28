"use client";

import { Suspense, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useProgress } from "@react-three/drei";

const MetaballsCanvas = dynamic(() => import("./three/MetaballsCanvas"), {
  ssr: false,
  loading: () => <div className="h-48 w-48 animate-pulse rounded-full bg-fg/10" />,
});

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
          <MetaballsCanvas />
        </div>
      </Suspense>
      <div className="text-center text-fg">
        <p className="text-lg font-semibold tracking-wide">Materializing shapes…</p>
        <p className="mt-1 text-sm font-medium text-fg/70">{formattedProgress}%</p>
      </div>
    </div>
  );
}
