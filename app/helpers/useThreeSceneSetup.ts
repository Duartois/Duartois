"use client";

import { useEffect } from "react";

import {
  createResponsiveVariantState,
  createVariantState,
  getDefaultPalette,
  type VariantName,
  variantMapping,
} from "@/components/three/types";
import {
  getStoredSceneState,
  updateStoredSceneState,
} from "@/app/helpers/threeSceneStore";
import { useThreeApp } from "@/app/helpers/threeAppContext";
import type { ThreeAppHandle } from "@/components/three/types";

type SceneOptions = {
  opacity?: number;
  parallax?: boolean;
  hovered?: boolean;
  resetOnUnmount?: boolean;
  enableScene?: boolean;
};

const DEFAULT_OPTIONS = {
  opacity: 0.3,
  parallax: true,
  hovered: false,
  enableScene: true,
} as const;

const applySceneState = (
  variantName: VariantName,
  {
    opacity,
    parallax,
    hovered,
  }: Required<Omit<SceneOptions, "resetOnUnmount" | "enableScene">>,
  app: ThreeAppHandle | null,
) => {
  if (!app) {
    const responsiveVariant = createResponsiveVariantState(
      variantMapping[variantName],
      window.innerWidth,
      window.innerHeight,
    );

    updateStoredSceneState({
      variantName,
      variant: responsiveVariant,
      opacity,
    });
    return false;
  }

  const stored = getStoredSceneState();
  const shouldUseStoredVariant =
    variantName !== "home" && stored.variantName === variantName && stored.variant;
  const responsiveVariant = shouldUseStoredVariant
    ? createVariantState(stored.variant)
    : createResponsiveVariantState(
        variantMapping[variantName],
        window.innerWidth,
        window.innerHeight,
      );

  app.setState((previous) => ({
    variantName,
    variant: responsiveVariant,
    palette: getDefaultPalette(previous.theme),
    parallax,
    hovered,
    opacity,
  }));

  updateStoredSceneState({
    variantName,
    variant: responsiveVariant,
    opacity,
  });

  return true;
};

export function useThreeSceneSetup(
  variantName: VariantName,
  {
    opacity = DEFAULT_OPTIONS.opacity,
    parallax = DEFAULT_OPTIONS.parallax,
    hovered = DEFAULT_OPTIONS.hovered,
    resetOnUnmount = false,
    enableScene = DEFAULT_OPTIONS.enableScene,
  }: SceneOptions = {},
) {
  const { app, setSceneActive } = useThreeApp();

  useEffect(() => {
    if (!enableScene) {
      return;
    }

    setSceneActive(true);

    return () => {
      setSceneActive(false);
    };
  }, [enableScene, setSceneActive]);

  useEffect(() => {
    let animationFrame: number | undefined;

    const apply = () => {
      const applied = applySceneState(variantName, {
        opacity,
        parallax,
        hovered,
      }, app);

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
  }, [app, hovered, opacity, parallax, variantName]);

  useEffect(() => {
    if (!resetOnUnmount) {
      return;
    }

    return () => {
      applySceneState(
        variantName,
        { opacity, parallax, hovered },
        app,
      );
    };
  }, [app, hovered, opacity, parallax, resetOnUnmount, variantName]);
}
