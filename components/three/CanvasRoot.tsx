"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";
import CoreCanvas from "./CoreCanvas";

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
    <div className="fixed top-0 left-0 h-full w-full z-0">
      <div
        className={classNames(
          "pointer-events-none fixed inset-0 -z-10 overflow-visible transition-opacity duration-700",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!isVisible}
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0 z-10">
            <CoreCanvas />
          </div>
        </div>
      </div>
    </div>
  );
}
