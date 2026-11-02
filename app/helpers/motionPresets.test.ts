import { afterEach, describe, expect, it } from "vitest";

import {
  MOTION_ATTRIBUTE,
  MOTION_PRESETS,
  getActiveMotionPreset,
  getMotionPreset,
} from "./motionPresets";

describe("motion presets", () => {
  it("keeps the same shapes on both tiers and only drops work on low", () => {
    const { high, low } = MOTION_PRESETS;

    expect(low.fallBlur).toBe(false);
    expect(low.fallWillChange).toBe(false);
    expect(low.maxPixelRatio).toBeLessThan(high.maxPixelRatio);
    expect(low.idleFrameMs).toBeGreaterThanOrEqual(high.idleFrameMs);
    // Motion never gets slower than the shared 60 fps ceiling.
    expect(low.activeFrameMs).toBeLessThanOrEqual(16);
    expect(low.sceneTransitionMs).toBeLessThanOrEqual(high.sceneTransitionMs);
  });

  it("defaults to the high tier", () => {
    expect(getMotionPreset()).toBe(MOTION_PRESETS.high);
  });

  describe("getActiveMotionPreset", () => {
    afterEach(() => {
      document.documentElement.removeAttribute(MOTION_ATTRIBUTE);
    });

    it("follows the tier set on <html>", () => {
      expect(getActiveMotionPreset()).toBe(MOTION_PRESETS.high);

      document.documentElement.setAttribute(MOTION_ATTRIBUTE, "low");
      expect(getActiveMotionPreset()).toBe(MOTION_PRESETS.low);
    });
  });
});
