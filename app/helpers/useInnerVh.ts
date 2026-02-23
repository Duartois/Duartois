"use client";

import { useEffect } from "react";

/**
 * Sets the --innerVh CSS custom property to window.innerHeight * 0.01
 *
 * This provides a reliable "1vh" unit that always reflects the *visible*
 * viewport height, excluding the mobile browser chrome (URL bar, toolbar).
 *
 * Usage in CSS:
 *   height: calc(var(--innerVh, 1vh) * 100)   → full visible height
 *   padding-top: calc(var(--innerVh, 1vh) * 40) → 40% of visible height
 *
 * The fallback `1vh` ensures SSR and first paint are safe. Once this hook
 * runs on the client the property is set and all subsequent calculations
 * use the real value.
 */
export function useInnerVh(): void {
  useEffect(() => {
    let rafId: number | undefined;

    const setVh = (height: number) => {
      document.documentElement.style.setProperty(
        "--innerVh",
        `${height * 0.01}px`,
      );
    };

    const update = () => {
      // Prefer visualViewport when available — it gives the exact visible
      // area height, accounting for the on-screen keyboard on mobile.
      const height =
        window.visualViewport?.height ?? window.innerHeight;
      setVh(height);
    };

    // Debounced update via rAF to batch rapid resize events (e.g. iOS Safari
    // fires many resize events as the URL bar animates in/out during scroll).
    const scheduleUpdate = () => {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = undefined;
        update();
      });
    };

    // Set immediately so there is no flash with the fallback value.
    update();

    // visualViewport is more reliable on mobile (handles keyboard, safe areas)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleUpdate);
      window.visualViewport.addEventListener("scroll", scheduleUpdate);
    }

    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleUpdate, {
      passive: true,
    });

    return () => {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", scheduleUpdate);
        window.visualViewport.removeEventListener("scroll", scheduleUpdate);
      }
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
    };
  }, []);
}
