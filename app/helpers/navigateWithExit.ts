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
    Number.isFinite(fallbackItems) && fallbackItems > 6
      ? 6 / fallbackItems
      : 1;
  let adjustedDuration = Math.round(baseDuration * scaleFactor);

  if (prefersReducedMotion) {
    adjustedDuration = Math.min(adjustedDuration, 220);
  }

  return Math.max(adjustedDuration, 0);
};

const shouldBypassExitDelay = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion) {
    return false;
  }

  const connection = (navigator as NavigatorConnection).connection;
  return Boolean(connection?.saveData || connection?.effectiveType === "2g");
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

  const exitDuration = getNavigationExitDuration(duration);
  const targetPath = scenePathname ?? url.pathname;

  applyNavigationSceneVariant(targetPath);
  dispatchAppEvent(APP_NAVIGATION_START_EVENT);
  onExitStart?.();

  const navigate = () => {
    router.push(`${url.pathname}${url.search}${url.hash}`);
    window.requestAnimationFrame(() => {
      dispatchAppEvent(APP_NAVIGATION_END_EVENT);
    });
  };

  clearNavigationTimeout();

  if (shouldBypassExitDelay()) {
    navigate();
    return;
  }

  navigationTimeout = window.setTimeout(navigate, Math.max(exitDuration, 0));
};
