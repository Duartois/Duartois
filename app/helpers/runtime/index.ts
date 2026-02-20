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
export const getWindow = (): Window | null =>
  isBrowser() ? window : null;

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