"use client";

import { useEffect, useRef, useState } from "react";

type CursorDetail = {
  x: number;
  y: number;
};

type VisibilityDetail = {
  visible: boolean;
};

const GRADIENT_STYLE =
  "radial-gradient(circle at center, rgba(124, 144, 255, 0.28), rgba(124, 144, 255, 0.06), rgba(124, 144, 255, 0))";

export default function CursorOverlay() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const gradientRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [failed, setFailed] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(media.matches);
    };

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => {
      media.removeEventListener("change", updatePreference);
    };
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted || typeof window === "undefined") {
      return;
    }

    const body = window.document.body;
    const shouldShowNativeCursor = prefersReducedMotion || failed || !enabled;

    if (shouldShowNativeCursor) {
      body.classList.add("cursor-visible");
    } else {
      body.classList.remove("cursor-visible");
    }

    return () => {
      body.classList.add("cursor-visible");
    };
  }, [enabled, failed, hasMounted, prefersReducedMotion]);

  useEffect(() => {
    if (!hasMounted || typeof window === "undefined") {
      return () => undefined;
    }

    if (prefersReducedMotion) {
      setEnabled(false);
      return () => undefined;
    }

    const gradient = gradientRef.current;
    const ring = ringRef.current;

    if (!gradient || !ring) {
      setFailed(true);
      setEnabled(false);
      return () => undefined;
    }

    setFailed(false);
    setEnabled(true);

    const events = window.__THREE_APP__?.bundle.events;
    let animationFrame = 0;
    let pointerVisible = false;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const setVisibility = (visible: boolean) => {
      if (pointerVisible === visible) return;
      pointerVisible = visible;
      gradient.classList.toggle("opacity-40", visible);
      gradient.classList.toggle("opacity-0", !visible);
      ring.classList.toggle("opacity-100", visible);
      ring.classList.toggle("opacity-0", !visible);

      if (events) {
        events.dispatchEvent(
          new CustomEvent<VisibilityDetail>("cursor-overlay-visibility", {
            detail: { visible },
          }),
        );
      }
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      gradient.style.left = `${currentX}px`;
      gradient.style.top = `${currentY}px`;
      ring.style.left = `${currentX}px`;
      ring.style.top = `${currentY}px`;

      animationFrame = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (events) {
        events.dispatchEvent(
          new CustomEvent<CursorDetail>("cursor-overlay-move", {
            detail: { x: targetX, y: targetY },
          }),
        );
      }

      if (!pointerVisible) {
        setVisibility(true);
      }
    };

    const handlePointerEnter = () => {
      setVisibility(true);
    };

    const handlePointerLeave = () => {
      setVisibility(false);
      if (events) {
        events.dispatchEvent(new CustomEvent("cursor-overlay-leave"));
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerenter", handlePointerEnter);
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerenter", handlePointerEnter);
      document.removeEventListener("pointerleave", handlePointerLeave);
      setVisibility(false);
      setEnabled(false);
    };
  }, [hasMounted, prefersReducedMotion]);

  if (prefersReducedMotion || failed) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden="true"
    >
      <div
        ref={gradientRef}
        className="pointer-events-none absolute h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 ease-out blur-3xl mix-blend-screen"
        style={{ background: GRADIENT_STYLE }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 opacity-0 transition-opacity duration-200 ease-out"
      >
        <div className="pointer-events-none absolute inset-0 rounded-full bg-white/20 blur-xl" />
        <div className="pointer-events-none absolute inset-0 rounded-full border border-white/20" />
      </div>
    </div>
  );
}
