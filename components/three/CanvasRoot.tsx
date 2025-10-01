"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";

import CoreCanvas from "./CoreCanvas";

interface CanvasRootProps {
  isReady: boolean;
}

export default function CanvasRoot({ isReady }: CanvasRootProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={classNames(
        "pointer-events-none fixed inset-0 -z-5 overflow-visible transition-opacity duration-700",
        isReady ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!isReady}
    >
      {mounted ? <CoreCanvas /> : null}
    </div>
  );
}
