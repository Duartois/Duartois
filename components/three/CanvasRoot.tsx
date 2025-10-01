"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";

import noiseUrl from "@/public/noise.png";

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
        "relative",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!isVisible}
    >
      <div
        className="absolute inset-0 z-10 bg-repeat bg-center [background-size:220px] opacity-40 mix-blend-soft-light pointer-events-none dark:opacity-30"
        style={{ backgroundImage: `url(${noiseUrl.src})` }}
      />
      <CoreCanvas />
    </div>
  );
}
