"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

// The server (and the hydration pass) assumes motion is fine; the real value
// is picked up right after, like framer-motion's hook did.
const getServerSnapshot = () => false;

/**
 * Whether the user asked the OS for reduced motion. A few lines of
 * `matchMedia` instead of pulling framer-motion into every page's bundle just
 * for this flag.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
