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

export default function RoutePrefetcher({ routes }: RoutePrefetcherProps) {
  const router = useRouter();
  const prefetchedRoutesRef = useRef(new Set<string>());

  useEffect(() => {
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
  }, [router, routes]);

  return null;
}
