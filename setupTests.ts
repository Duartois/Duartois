import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup DOM after each test
afterEach(() => {
  cleanup();
});

// ─── Browser API mocks (jsdom does not implement these) ───────────────────────

// window.matchMedia — used by AnimationQualityContext and Three.js scene
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ResizeObserver — used by canvas-aware components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// requestIdleCallback — used by CoreCanvas for deferred scene init
global.requestIdleCallback = vi.fn((cb) => {
  cb({ didTimeout: false, timeRemaining: () => 50 });
  return 0;
});

global.cancelIdleCallback = vi.fn();
