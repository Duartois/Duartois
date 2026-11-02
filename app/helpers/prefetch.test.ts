import { describe, expect, it, vi } from "vitest";

import { prefetchRoute } from "./prefetch";

describe("prefetchRoute", () => {
  it("prefetches each route only once, with the full payload", () => {
    const router = { prefetch: vi.fn() };

    prefetchRoute(router, "/work/once");
    prefetchRoute(router, "/work/once");
    prefetchRoute(router, "/work/other");

    expect(router.prefetch).toHaveBeenCalledTimes(2);
    expect(router.prefetch).toHaveBeenCalledWith(
      "/work/once",
      expect.objectContaining({ kind: expect.anything() }),
    );
  });

  it("stays quiet on data-saver connections", () => {
    const router = { prefetch: vi.fn() };
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    });

    prefetchRoute(router, "/work/saver");

    expect(router.prefetch).not.toHaveBeenCalled();
    Reflect.deleteProperty(navigator, "connection");
  });
});
