"use client";

import { PropsWithChildren, useEffect } from "react";

/**
 * Detecta se o dispositivo é touch/mobile.
 * Em dispositivos touch, o scroll nativo do browser já é otimizado com
 * momentum e inércia — adicionar smooth scroll via JS aumenta latência e
 * consome CPU/memória desnecessariamente no mobile.
 */
function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

/** Input that can start (or continue) a smooth scroll. */
const LENIS_WAKE_EVENTS = [
  "wheel",
  "keydown",
  "touchstart",
  "pointerdown",
  "scroll",
  "resize",
] as const;

/** How long the loop keeps running after the last sign of scrolling. */
const LENIS_IDLE_GRACE_MS = 300;

export default function SmoothScrollProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const initSmoothScroll = async () => {
      // Em dispositivos touch/mobile, o scroll nativo é superior ao JS scroll.
      // Desabilitar o smooth scroll JS melhora significativamente a performance
      // no Chrome Mobile, Safari iOS e outros browsers mobile.
      if (isTouchDevice()) {
        return;
      }

      try {
        const { default: Lenis } = await import("lenis");

        if (cancelled) {
          return;
        }

        // `autoRaf` kept a requestAnimationFrame loop running on every frame
        // for the whole visit, even on pages that never scroll. Drive Lenis
        // ourselves instead: the loop only runs while there is input or the
        // smooth scroll is still easing, and goes back to sleep afterwards.
        const lenis = new Lenis({
          autoRaf: false,
          smoothWheel: true,
          lerp: 0.1,
        });

        let frame = 0;
        let lastActiveAt = 0;

        const loop = (time: number) => {
          frame = 0;
          lenis.raf(time);

          if (lenis.isScrolling) {
            lastActiveAt = time;
          }

          if (time - lastActiveAt < LENIS_IDLE_GRACE_MS) {
            frame = window.requestAnimationFrame(loop);
          }
        };

        const wake = () => {
          lastActiveAt = window.performance.now();
          if (!frame) {
            frame = window.requestAnimationFrame(loop);
          }
        };

        LENIS_WAKE_EVENTS.forEach((eventName) =>
          window.addEventListener(eventName, wake, { passive: true }),
        );
        wake();

        cleanup = () => {
          LENIS_WAKE_EVENTS.forEach((eventName) =>
            window.removeEventListener(eventName, wake),
          );
          window.cancelAnimationFrame(frame);
          lenis.destroy();
        };
      } catch (error) {
        // Native scrolling still works without the smoothing layer.
        console.error("Falha ao inicializar smooth scrolling", error);
      }
    };

    void initSmoothScroll();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return children;
}
