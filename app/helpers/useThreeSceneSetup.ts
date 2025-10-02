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
  window.__THREE_APP__?.setState((previous) => ({
    variantName,
    palette: getDefaultPalette(previous.theme),
    parallax,
    hovered,
    opacity,
  }));
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
    applySceneState(variantName, { opacity, parallax, hovered });
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
