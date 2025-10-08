"use client";

import { useEffect } from "react";

import { getDefaultPalette, type VariantName } from "@/components/three/types";

type SceneOptions = {
  opacity?: number;
  parallax?: boolean;
  hovered?: boolean;
  resetOnUnmount?: boolean;
};

const DEFAULT_OPTIONS = {
  opacity: 0.3,
  parallax: true,
  hovered: false,
} as const;

const applySceneState = (
  variantName: VariantName,
  { opacity, parallax, hovered }: Required<Omit<SceneOptions, "resetOnUnmount">>,
) => {
  const app = window.__THREE_APP__;

  if (!app) {
    return false;
  }

  app.setState((previous) => ({
    variantName,
    palette: getDefaultPalette(previous.theme),
    parallax,
    hovered,
    opacity,
  }));

  return true;
};

export function useThreeSceneSetup(
  variantName: VariantName,
  {
    opacity = DEFAULT_OPTIONS.opacity,
    parallax = DEFAULT_OPTIONS.parallax,
    hovered = DEFAULT_OPTIONS.hovered,
    resetOnUnmount = false,
  }: SceneOptions = {},
) {
  useEffect(() => {
    let animationFrame: number | undefined;

    const apply = () => {
      const applied = applySceneState(variantName, {
        opacity,
        parallax,
        hovered,
      });

      if (!applied) {
        animationFrame = window.requestAnimationFrame(apply);
      }
    };

    apply();

    return () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [hovered, opacity, parallax, variantName]);

  useEffect(() => {
    if (!resetOnUnmount) {
      return;
    }

    return () => {
      applySceneState(variantName, { opacity, parallax, hovered });
    };
  }, [hovered, opacity, parallax, resetOnUnmount, variantName]);
}
