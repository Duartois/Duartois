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
    const update = () => {
      document.documentElement.style.setProperty(
        "--innerVh",
        `${window.innerHeight * 0.01}px`,
      );
    };

    // Set immediately so there is no flash with the fallback value.
    update();

    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
}
