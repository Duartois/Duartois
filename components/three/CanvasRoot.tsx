"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";

import CoreCanvas from "./CoreCanvas";

interface CanvasRootProps {
  isReady: boolean;
}

export default function CanvasRoot({ isReady }: CanvasRootProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      setShouldRender(true);
    }
  }, [isReady]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [shouldRender]);

  if (!hasMounted || !shouldRender) {
    return null;
  }

  return (
    <div
      className={classNames(
        "pointer-events-none fixed inset-0 -z-5 overflow-visible transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!isVisible}
    >
      <CoreCanvas />
    </div>
  );
}
