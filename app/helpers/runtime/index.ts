/**
 * Runtime primitives — SSR-safe browser utilities and math helpers.
 * Consolidates browser.ts and math.ts into a single import surface.
 *
 * Usage:
 *   import { isBrowser, getWindow, clamp } from "@/app/helpers/runtime";
 */

// ─── Browser ────────────────────────────────────────────────────────────────

/** Returns `true` only when running in an actual browser (not SSR/Node). */
export const isBrowser = (): boolean => typeof window !== "undefined";

/** Returns the global `window` object, or `null` during SSR. */
export const getWindow = (): Window | null => (isBrowser() ? window : null);

// ─── Safari / iOS Detection ──────────────────────────────────────────────────

/**
 * Returns `true` when running in Safari (desktop or mobile).
 *
 * Detection strategy: checks for the presence of `AppleWebKit` in the UA
 * while excluding Chrome/Chromium-based browsers (which also carry AppleWebKit).
 * This is intentionally UA-based because CSS/API feature detection cannot
 * distinguish Safari from Chrome on iOS (both use WebKit on that platform).
 *
 * SSR-safe: always returns `false` on the server.
 */
export const isSafari = (): boolean => {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent;
  return /AppleWebKit/.test(ua) && !/Chrome|Chromium|CriOS|EdgA|FxiOS/.test(ua);
};

/**
 * Returns `true` when running on an iOS device (iPhone / iPad / iPod).
 *
 * Covers both legacy UA strings and modern iPads that report as "Macintosh"
 * but expose multi-touch support via `navigator.maxTouchPoints`.
 *
 * SSR-safe: always returns `false` on the server.
 */
export const isIOS = (): boolean => {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPod/.test(ua)) return true;
  if (/iPad/.test(ua)) return true;
  // iPad on iOS 13+ reports as desktop Safari but has touch points
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
};

/**
 * Returns `true` when running on an Android device.
 *
 * SSR-safe: always returns `false` on the server.
 */
export const isAndroid = (): boolean => {
  if (!isBrowser()) return false;
  return /Android/i.test(navigator.userAgent);
};

/**
 * Returns `true` when running on any mobile device (iOS or Android).
 *
 * Uses a combination of UA detection and touch capability for reliability.
 * SSR-safe: always returns `false` on the server.
 */
export const isMobileDevice = (): boolean => {
  if (!isBrowser()) return false;
  if (isIOS() || isAndroid()) return true;
  // Fallback: coarse pointer + small viewport
  return (
    window.matchMedia("(pointer: coarse)").matches &&
    window.innerWidth <= 768
  );
};

/**
 * Returns a capped device pixel ratio suitable for WebGL rendering.
 *
 * Safari on Apple Silicon and Retina iPhones reports DPR of 2–3, which
 * multiplies the fragment count by 4–9×. We cap at 2 for all mobile devices
 * and at 1.5 for Safari specifically to keep GPU workload manageable while
 * still looking sharp enough on high-density displays.
 *
 * @param forceMax - Override ceiling (useful for testing). Defaults to auto.
 */
export const getRendererPixelRatio = (forceMax?: number): number => {
  if (!isBrowser()) return 1;

  const dpr = window.devicePixelRatio ?? 1;

  if (forceMax !== undefined) {
    return Math.min(dpr, forceMax);
  }

  // iOS Safari: cap at 2 — Retina is fine, but 3× is wasteful for a 3D scene
  if (isIOS()) return Math.min(dpr, 2);

  // Android: cap at 2 — many Android flagships have DPR of 2.75–3
  if (isAndroid()) return Math.min(dpr, 2);

  // Desktop Safari: cap at 1.5 to avoid thrashing on Pro Display XDR (6K)
  if (isSafari()) return Math.min(dpr, 1.5);

  // Everything else: cap at 2 (covers most Android flagships)
  return Math.min(dpr, 2);
};

/**
 * Returns `true` if the current device is likely low-powered enough that
 * heavy WebGL/animation work should be skipped or simplified.
 *
 * Combines hardware signals (memory, CPU cores) with browser/OS signals
 * (Safari on iOS = tight memory budget, save-data, reduced-motion).
 *
 * SSR-safe: returns `false` on the server (let the client decide).
 */
export const isLowPowerDevice = (): boolean => {
  if (!isBrowser()) return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return true;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  const deviceMemory = nav.deviceMemory;
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 0;
  const connection = nav.connection ?? {};
  const saveData = Boolean(connection.saveData);
  const effectiveType = connection.effectiveType ?? "";

  const isSlowNetwork =
    saveData || effectiveType.includes("2g") || effectiveType.includes("3g");

  const isLowHardware =
    (deviceMemory !== undefined && deviceMemory <= 2) ||
    (hardwareConcurrency > 0 && hardwareConcurrency <= 2);

  return isSlowNetwork || isLowHardware;
};

// ─── Math ────────────────────────────────────────────────────────────────────

/** Clamps `value` between `min` and `max` (inclusive). */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Linear interpolation between `a` and `b` at factor `t` ∈ [0, 1]. */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** Maps `value` from range [inMin, inMax] to [outMin, outMax]. */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
