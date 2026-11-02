"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { prefetchRoute, shouldAllowPrefetch } from "@/app/helpers/prefetch";

const ROUTE_MODULE_LOADERS: Record<string, () => Promise<unknown>> = {
  "/work": () => import("@/app/work/page"),
  "/about": () => import("@/app/about/page"),
  "/contact": () => import("@/app/contact/page"),
} as const;

const warmedModules = new Set<string>();

export type RoutePrefetcherProps = {
  routes: readonly string[];
};

/**
 * Warms the main routes once, when the browser is idle, so navigating between
 * them is instant. Links elsewhere don't prefetch on their own (they used to
 * fire several server renders per page load); project pages are prefetched on
 * intent instead.
 */
export default function RoutePrefetcher({ routes }: RoutePrefetcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasIdleCallback = typeof window.requestIdleCallback === "function";
    const schedule: (callback: IdleRequestCallback) => number = hasIdleCallback
      ? (callback) => window.requestIdleCallback(callback, { timeout: 3000 })
      : (callback: IdleRequestCallback) =>
          window.setTimeout(
            () => callback({ didTimeout: false, timeRemaining: () => 0 }),
            800,
          );

    const prefetchRoutes = () => {
      if (!shouldAllowPrefetch()) {
        return;
      }

      routes.forEach((route) => {
        if (route === pathname) {
          return;
        }

        prefetchRoute(router, route);

        const warmRouteModule = ROUTE_MODULE_LOADERS[route];
        if (warmRouteModule && !warmedModules.has(route)) {
          warmedModules.add(route);
          void warmRouteModule().catch(() => {});
        }
      });
    };

    const handle = schedule(prefetchRoutes);

    return () => {
      if (hasIdleCallback && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(handle);
        return;
      }

      window.clearTimeout(handle);
    };
  }, [router, routes, pathname]);

  return null;
}
