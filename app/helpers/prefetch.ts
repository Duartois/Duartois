"use client";

import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";

type NavigatorConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

type PrefetchingRouter = {
  prefetch: (href: string, options?: { kind: PrefetchKind }) => void;
};

const getConnection = () =>
  typeof navigator === "undefined"
    ? undefined
    : (navigator as NavigatorConnection).connection;

/** Light prefetches (route payloads): skipped on data-saver and 2G. */
export const shouldAllowPrefetch = () => {
  if (typeof navigator === "undefined") {
    return false;
  }

  const connection = getConnection();
  return !(
    connection?.saveData ||
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "slow-2g"
  );
};

/** Heavy background downloads (images) also wait out 3G. */
export const shouldPreloadHeavyAssets = () =>
  shouldAllowPrefetch() && getConnection()?.effectiveType !== "3g";

const prefetchedRoutes = new Set<string>();

/**
 * Prefetches the full payload of a route once. Pages here are dynamic, so an
 * auto prefetch would only fetch the layout and the click would still wait on
 * the server; a full one makes the navigation instant. Used on intent (hover,
 * focus, touch) and for the main routes at idle — never for every link in view.
 */
export const prefetchRoute = (router: PrefetchingRouter, href: string) => {
  if (!shouldAllowPrefetch() || prefetchedRoutes.has(href)) {
    return;
  }

  prefetchedRoutes.add(href);
  router.prefetch(href, { kind: PrefetchKind.FULL });
};
