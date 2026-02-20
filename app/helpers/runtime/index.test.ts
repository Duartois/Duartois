/**
 * Tests for app/helpers/runtime — Safari/iOS detection and device capability helpers.
 *
 * Strategy: mock `navigator.userAgent`, `navigator.maxTouchPoints`,
 * `window.devicePixelRatio`, and `window.matchMedia` per-test so that each
 * assertion is completely isolated.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isBrowser,
  getWindow,
  isSafari,
  isIOS,
  getRendererPixelRatio,
  isLowPowerDevice,
  clamp,
  lerp,
  mapRange,
} from "./index";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Replace window.navigator with a partial mock. */
function mockNavigator(overrides: Record<string, unknown>) {
  Object.defineProperty(window, "navigator", {
    value: { ...window.navigator, ...overrides },
    writable: true,
    configurable: true,
  });
}

/** Replace window.devicePixelRatio. */
function mockDPR(value: number) {
  Object.defineProperty(window, "devicePixelRatio", {
    value,
    writable: true,
    configurable: true,
  });
}

/** Mock window.matchMedia to return a specific `matches` value. */
function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    value: vi.fn((_query: string) => ({
      matches,
      media: _query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    writable: true,
    configurable: true,
  });
}

// ─── isBrowser ────────────────────────────────────────────────────────────────

describe("isBrowser", () => {
  it("returns true in jsdom environment", () => {
    expect(isBrowser()).toBe(true);
  });
});

// ─── getWindow ────────────────────────────────────────────────────────────────

describe("getWindow", () => {
  it("returns the window object in jsdom", () => {
    expect(getWindow()).toBe(window);
  });
});

// ─── isSafari ─────────────────────────────────────────────────────────────────

describe("isSafari", () => {
  afterEach(() => vi.restoreAllMocks());

  const SAFARI_UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
  const CHROME_UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  const FIREFOX_UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0";
  const IOS_SAFARI_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  const CHROME_IOS_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.0.0 Mobile/15E148 Safari/604.1";
  const EDGE_IOS_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgA/124.0.0.0 Mobile/15E148 Safari/604.1";

  it("returns true for desktop Safari", () => {
    mockNavigator({ userAgent: SAFARI_UA });
    expect(isSafari()).toBe(true);
  });

  it("returns true for iOS Safari", () => {
    mockNavigator({ userAgent: IOS_SAFARI_UA, maxTouchPoints: 5 });
    expect(isSafari()).toBe(true);
  });

  it("returns false for Chrome on macOS", () => {
    mockNavigator({ userAgent: CHROME_UA });
    expect(isSafari()).toBe(false);
  });

  it("returns false for Firefox on macOS", () => {
    mockNavigator({ userAgent: FIREFOX_UA });
    expect(isSafari()).toBe(false);
  });

  it("returns false for Chrome on iOS (CriOS)", () => {
    mockNavigator({ userAgent: CHROME_IOS_UA, maxTouchPoints: 5 });
    expect(isSafari()).toBe(false);
  });

  it("returns false for Edge on iOS (EdgA)", () => {
    mockNavigator({ userAgent: EDGE_IOS_UA, maxTouchPoints: 5 });
    expect(isSafari()).toBe(false);
  });
});

// ─── isIOS ────────────────────────────────────────────────────────────────────

describe("isIOS", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns true for iPhone UA", () => {
    mockNavigator({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      maxTouchPoints: 5,
    });
    expect(isIOS()).toBe(true);
  });

  it("returns true for iPad UA (legacy)", () => {
    mockNavigator({
      userAgent:
        "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
      maxTouchPoints: 5,
    });
    expect(isIOS()).toBe(true);
  });

  it("returns true for iPadOS 13+ (reports as Macintosh + maxTouchPoints)", () => {
    mockNavigator({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      maxTouchPoints: 5,
    });
    expect(isIOS()).toBe(true);
  });

  it("returns false for desktop Safari (Macintosh, maxTouchPoints 0)", () => {
    mockNavigator({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      maxTouchPoints: 0,
    });
    expect(isIOS()).toBe(false);
  });

  it("returns false for Android Chrome", () => {
    mockNavigator({
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      maxTouchPoints: 5,
    });
    expect(isIOS()).toBe(false);
  });
});

// ─── getRendererPixelRatio ────────────────────────────────────────────────────

describe("getRendererPixelRatio", () => {
  afterEach(() => vi.restoreAllMocks());

  it("caps iOS DPR at 2 when device reports 3", () => {
    mockDPR(3);
    mockNavigator({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      maxTouchPoints: 5,
    });
    expect(getRendererPixelRatio()).toBe(2);
  });

  it("leaves iOS DPR as-is when it is already ≤ 2", () => {
    mockDPR(2);
    mockNavigator({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      maxTouchPoints: 5,
    });
    expect(getRendererPixelRatio()).toBe(2);
  });

  it("caps desktop Safari DPR at 1.5 when device reports 2", () => {
    mockDPR(2);
    mockNavigator({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      maxTouchPoints: 0,
    });
    expect(getRendererPixelRatio()).toBe(1.5);
  });

  it("caps non-Safari DPR at 2", () => {
    mockDPR(3);
    mockNavigator({
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      maxTouchPoints: 5,
    });
    expect(getRendererPixelRatio()).toBe(2);
  });

  it("respects the forceMax override", () => {
    mockDPR(3);
    expect(getRendererPixelRatio(1)).toBe(1);
  });
});

// ─── isLowPowerDevice ─────────────────────────────────────────────────────────

describe("isLowPowerDevice", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns true when prefers-reduced-motion is active", () => {
    mockMatchMedia(true); // all queries return matches:true
    expect(isLowPowerDevice()).toBe(true);
  });

  it("returns true with 1 GB device memory", () => {
    mockMatchMedia(false);
    mockNavigator({ deviceMemory: 1, hardwareConcurrency: 8 });
    expect(isLowPowerDevice()).toBe(true);
  });

  it("returns true with 2 CPU cores", () => {
    mockMatchMedia(false);
    mockNavigator({ deviceMemory: 8, hardwareConcurrency: 2 });
    expect(isLowPowerDevice()).toBe(true);
  });

  it("returns true when save-data is enabled", () => {
    mockMatchMedia(false);
    mockNavigator({
      deviceMemory: 8,
      hardwareConcurrency: 8,
      connection: { saveData: true, effectiveType: "4g" },
    });
    expect(isLowPowerDevice()).toBe(true);
  });

  it("returns false on a capable device with no reduced-motion preference", () => {
    mockMatchMedia(false);
    mockNavigator({
      deviceMemory: 16,
      hardwareConcurrency: 8,
      connection: { saveData: false, effectiveType: "4g" },
    });
    expect(isLowPowerDevice()).toBe(false);
  });
});

// ─── Math helpers ─────────────────────────────────────────────────────────────

describe("clamp", () => {
  it("clamps below minimum", () => expect(clamp(-5, 0, 10)).toBe(0));
  it("clamps above maximum", () => expect(clamp(15, 0, 10)).toBe(10));
  it("passes through in-range values", () => expect(clamp(5, 0, 10)).toBe(5));
});

describe("lerp", () => {
  it("returns a at t=0", () => expect(lerp(0, 10, 0)).toBe(0));
  it("returns b at t=1", () => expect(lerp(0, 10, 1)).toBe(10));
  it("returns midpoint at t=0.5", () => expect(lerp(0, 10, 0.5)).toBe(5));
});

describe("mapRange", () => {
  it("maps 0 in [0,1] to 0 in [0,100]", () =>
    expect(mapRange(0, 0, 1, 0, 100)).toBe(0));
  it("maps 1 in [0,1] to 100 in [0,100]", () =>
    expect(mapRange(1, 0, 1, 0, 100)).toBe(100));
  it("maps 0.5 in [0,1] to 50 in [0,100]", () =>
    expect(mapRange(0.5, 0, 1, 0, 100)).toBe(50));
});