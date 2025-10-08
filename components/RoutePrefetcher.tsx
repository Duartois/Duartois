"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
      void router.prefetch(route);
    });
  }, [router, routes]);

  return null;
}
