"use client";

import { getFallExitDuration } from "@/components/fallAnimation";
import { applyNavigationSceneVariant } from "@/app/helpers/threeNavigation";
import {
  APP_NAVIGATION_END_EVENT,
  APP_NAVIGATION_START_EVENT,
  dispatchAppEvent,
} from "@/app/helpers/appEvents";

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
  window.__THREE_APP__?.setState({ variantTransitionMs: exitDuration });
  dispatchAppEvent(APP_NAVIGATION_START_EVENT);
  onExitStart?.();

  const navigate = () => {
    router.push(`${url.pathname}${url.search}${url.hash}`);
    // Aguarda a próxima frame para garantir que a nova página começou a montar
    // antes de disparar o evento de fim de navegação
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        dispatchAppEvent(APP_NAVIGATION_END_EVENT);
        window.__THREE_APP__?.setState({ variantTransitionMs: null });
      });
    });
  };

  clearNavigationTimeout();

  navigationTimeout = window.setTimeout(navigate, Math.max(exitDuration, 0));
};
