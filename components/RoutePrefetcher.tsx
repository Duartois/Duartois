"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";

const ROUTE_MODULE_LOADERS: Record<string, () => Promise<unknown>> = {
  "/work": () => import("@/app/work/page"),
  "/about": () => import("@/app/about/page"),
  "/contact": () => import("@/app/contact/page"),
} as const;

export type RoutePrefetcherProps = {
  routes: readonly string[];
};

type NavigatorConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

export default function RoutePrefetcher({ routes }: RoutePrefetcherProps) {
  const router = useRouter();
  const prefetchedRoutesRef = useRef(new Set<string>());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const connection = (navigator as NavigatorConnection).connection;
    const shouldDeferPrefetch =
      connection?.saveData || connection?.effectiveType === "2g";

    const schedule =
      "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (callback: IdleRequestCallback) =>
            window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 300);

    const handle = schedule(() => {
      if (shouldDeferPrefetch) {
        return;
      }

      routes.forEach((route) => {
        if (prefetchedRoutesRef.current.has(route)) {
          return;
        }

        prefetchedRoutesRef.current.add(route);
        void router.prefetch(route, { kind: PrefetchKind.FULL });

        const warmRouteModule = ROUTE_MODULE_LOADERS[route];
        if (warmRouteModule) {
          void warmRouteModule().catch(() => {});
        }
      });
    });

    return () => {
      if ("cancelIdleCallback" in window) {
        window.cancelIdleCallback(handle as number);
      } else {
        window.clearTimeout(handle as number);
      }
    };
  }, [router, routes]);

  return null;
}
