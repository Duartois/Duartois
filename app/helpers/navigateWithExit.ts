"use client";

import { getFallExitDuration } from "@/components/fallAnimation";
import { applyNavigationSceneVariant } from "@/app/helpers/threeNavigation";
import {
  APP_NAVIGATION_END_EVENT,
  APP_NAVIGATION_START_EVENT,
  APP_ROUTE_COMMIT_EVENT,
  dispatchAppEvent,
} from "@/app/helpers/appEvents";
import { getActiveMotionPreset } from "@/app/helpers/motionPresets";

type RouterLike = {
  push: (href: string) => void;
};

export const EXIT_NAVIGATION_ATTRIBUTE = "data-exit-navigation" as const;

type NavigatorConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

type NavigateWithExitOptions = {
  duration?: number;
  onExitStart?: () => void;
  scenePathname?: string;
};

/** Safety net: how long to wait for the router before releasing the exit state anyway. */
const ROUTE_COMMIT_TIMEOUT_MS = 4000;

let navigationTimeout: number | undefined;
let isNavigating = false;
let hasEndListener = false;

const clearNavigationTimeout = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (navigationTimeout) {
    window.clearTimeout(navigationTimeout);
    navigationTimeout = undefined;
  }
};

export const resetNavigationState = () => {
  clearNavigationTimeout();
  isNavigating = false;
};

const ensureNavigationEndListener = () => {
  if (hasEndListener || typeof window === "undefined") {
    return;
  }

  hasEndListener = true;

  window.addEventListener(APP_NAVIGATION_END_EVENT, resetNavigationState);
  window.addEventListener("pagehide", resetNavigationState);
};

const getNavigationExitDuration = (durationOverride?: number) => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return durationOverride ?? getFallExitDuration(6, "work");
  }

  if (Number.isFinite(durationOverride)) {
    return durationOverride as number;
  }

  const fromBody = Number(document.body?.dataset.navigationExitDuration);
  const totalItems = Number(document.body?.dataset.navigationExitItems);
  const fallbackItems = Number.isFinite(totalItems) ? totalItems : 6;
  const baseDuration = Number.isFinite(fromBody)
    ? fromBody
    : getFallExitDuration(fallbackItems, "work");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const scaleFactor =
    Number.isFinite(fallbackItems) && fallbackItems > 6 ? 6 / fallbackItems : 1;
  let adjustedDuration = Math.round(baseDuration * scaleFactor);

  if (prefersReducedMotion) {
    adjustedDuration = Math.min(adjustedDuration, 220);
  }
  // Cap global para evitar que animações longas bloqueiem a navegação
  adjustedDuration = Math.min(adjustedDuration, 400);
  return Math.max(adjustedDuration, 0);
};

const getNetworkAwareExitDelay = (baseDelay: number) => {
  if (typeof window === "undefined") {
    return baseDelay;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion) {
    return Math.min(baseDelay, 220);
  }

  const connection = (navigator as NavigatorConnection).connection;
  const isConstrainedNetwork = Boolean(
    connection?.saveData ||
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "3g",
  );

  if (!isConstrainedNetwork) {
    return baseDelay;
  }

  // Em redes lentas, não pulamos mais as animações: apenas encurtamos
  // para manter consistência visual no mobile sem bloquear a navegação.
  const constrainedDelay = Math.round(baseDelay * 0.7);
  return Math.max(Math.min(constrainedDelay, baseDelay), 180);
};

/**
 * Resolves once the router has actually swapped in `toPath` (AppShell fires
 * APP_ROUTE_COMMIT_EVENT when the pathname changes), or after a timeout.
 *
 * The exit state used to be released two frames after `router.push()`. On a
 * slow connection the route can take much longer to arrive, which made the old
 * page flash back before the new one replaced it — it looked like a reload.
 */
const waitForRouteCommit = (fromPath: string, toPath: string) =>
  new Promise<void>((resolve) => {
    if (fromPath === toPath) {
      resolve();
      return;
    }

    let timeoutId: number | undefined;
    const done = () => {
      window.removeEventListener(APP_ROUTE_COMMIT_EVENT, done);
      window.clearTimeout(timeoutId);
      resolve();
    };

    window.addEventListener(APP_ROUTE_COMMIT_EVENT, done);
    timeoutId = window.setTimeout(done, ROUTE_COMMIT_TIMEOUT_MS);
  });

export const navigateWithExit = (
  router: RouterLike,
  href: string,
  { duration, onExitStart, scenePathname }: NavigateWithExitOptions = {},
) => {
  if (typeof window === "undefined") {
    router.push(href);
    return;
  }

  ensureNavigationEndListener();

  const url = new URL(href, window.location.href);

  if (isNavigating) {
    return;
  }

  isNavigating = true;

  const exitDuration = getNetworkAwareExitDelay(
    getNavigationExitDuration(duration),
  );
  const targetPath = scenePathname ?? url.pathname;

  applyNavigationSceneVariant(targetPath);
  // The shapes keep gliding through the page swap, so the transition must last
  // at least as long as the preset says — not just the (short) exit animation.
  window.__THREE_APP__?.setState({
    variantTransitionMs: Math.max(
      exitDuration,
      getActiveMotionPreset().sceneTransitionMs,
    ),
  });
  dispatchAppEvent(APP_NAVIGATION_START_EVENT);
  onExitStart?.();

  const navigate = () => {
    const committed = waitForRouteCommit(
      window.location.pathname,
      url.pathname,
    );
    router.push(`${url.pathname}${url.search}${url.hash}`);
    // Aguarda a nova rota montar (e mais uma frame) antes de disparar o evento
    // de fim de navegação.
    void committed.then(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          dispatchAppEvent(APP_NAVIGATION_END_EVENT);
          window.__THREE_APP__?.setState({ variantTransitionMs: null });
        });
      });
    });
  };

  clearNavigationTimeout();

  navigationTimeout = window.setTimeout(navigate, Math.max(exitDuration, 0));
};
