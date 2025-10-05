"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";
import CoreCanvas from "./CoreCanvas";
import Noise from "../Noise";

interface CanvasRootProps {
  isReady: boolean;
}

export default function CanvasRoot({ isReady }: CanvasRootProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setIsVisible(isReady);
    });

    return () => cancelAnimationFrame(frame);
  }, [hasMounted, isReady]);

  if (!hasMounted) {
    return null;
  }

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
