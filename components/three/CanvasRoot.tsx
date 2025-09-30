"use client";

import { useEffect, useState } from "react";

import CoreCanvas from "./CoreCanvas";

export default function CanvasRoot() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-5 overflow-visible"
      aria-hidden
    >
      {mounted ? <CoreCanvas /> : null}
    </div>
  );
}
