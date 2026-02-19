"use client";

import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useThreeApp } from "@/app/helpers/threeAppContext";
import CoreCanvas from "./CoreCanvas";
import Noise from "../Noise";

interface GlobalCanvasProps {
  isReady?: boolean;
}

export default function GlobalCanvas({ isReady = true }: GlobalCanvasProps) {
  const { setSceneActive } = useThreeApp();
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setSceneActive(true);
    setHasMounted(true);
    setIsVisible(false);
  }, [setSceneActive]);

  useEffect(() => {
    if (!hasMounted) return;
    const frame = requestAnimationFrame(() => {
      setIsVisible(isReady);
    });
    return () => cancelAnimationFrame(frame);
  }, [hasMounted, isReady]);

  if (!hasMounted) return null;

  return (
    <div
      className={classNames(
        "pointer-events-none fixed inset-0 z-0 overflow-visible transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!isVisible}
      data-fall-skip="true"
    >
      <div className="relative h-full w-full">
        <div className="absolute inset-0 z-0">
          <Noise />
          <CoreCanvas isReady={isReady} />
        </div>
      </div>
    </div>
  );
}
