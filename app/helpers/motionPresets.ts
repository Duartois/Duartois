import type { GeometryDetail } from "@/components/three/geometry";

/**
 * Animation presets, one per performance tier.
 *
 * Everything that trades visual richness for frame time lives here, so the 3D
 * scene, the fall-in/out choreography and the CSS (`[data-motion]`) all agree
 * on what "low" means. The tiers keep the same shapes, colours and timing
 * language — they only drop work the eye can't miss (extra tessellation,
 * animated blur filters, permanent compositor layers, spare frames).
 */
export type MotionTier = "high" | "low";

export type MotionPreset = {
  /** Time (ms) for the 3D shapes to cover ~98% of a layout change. */
  sceneTransitionMs: number;
  /** Minimum gap (ms) between rendered frames while something moves. */
  activeFrameMs: number;
  /** Gap (ms) between frames of the idle "breathing" heartbeat. */
  idleFrameMs: number;
  /** Ceiling for the canvas pixel ratio. */
  maxPixelRatio: number;
  /** Tessellation tier for the signature shapes (desktop). */
  geometry: GeometryDetail;
  /** Fall-in/out items fade through a blur filter. */
  fallBlur: boolean;
  /** Fall-in/out items keep `will-change` layers alive. */
  fallWillChange: boolean;
};

export const MOTION_PRESETS: Record<MotionTier, MotionPreset> = {
  high: {
    sceneTransitionMs: 820,
    activeFrameMs: 12,
    idleFrameMs: 50,
    maxPixelRatio: 2,
    geometry: "high",
    fallBlur: true,
    fallWillChange: true,
  },
  low: {
    sceneTransitionMs: 700,
    activeFrameMs: 12,
    idleFrameMs: 66,
    maxPixelRatio: 1.5,
    geometry: "low",
    fallBlur: false,
    fallWillChange: false,
  },
};

export const MOTION_ATTRIBUTE = "data-motion" as const;

export const getMotionPreset = (tier: MotionTier = "high"): MotionPreset =>
  MOTION_PRESETS[tier];

/** Preset for the tier currently applied to the document (see AnimationQualityProvider). */
export const getActiveMotionPreset = (): MotionPreset => {
  if (typeof document === "undefined") {
    return MOTION_PRESETS.high;
  }

  return document.documentElement.getAttribute(MOTION_ATTRIBUTE) === "low"
    ? MOTION_PRESETS.low
    : MOTION_PRESETS.high;
};
