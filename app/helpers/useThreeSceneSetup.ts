"use client";

import { useEffect } from "react";

import {
  createResponsiveVariantState,
  createVariantState,
  getDefaultPalette,
  type VariantName,
  variantMapping,
} from "@/components/three/types";
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
    return false;
  }

  const responsiveVariant = createResponsiveVariantState(
    variantMapping[variantName],
    window.innerWidth,
    window.innerHeight,
  );

  app.setState({
    variant: createVariantState(responsiveVariant),
    parallax,
    hovered,
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

  // A cena agora é gerenciada globalmente pelo GlobalCanvas no AppShell.
  // Aplica a variante correta para a página atual sempre que o app estiver disponível.

  useEffect(() => {
    let animationFrame: number | undefined;

    const apply = () => {
      const applied = applySceneState(
        variantName,
        {
          opacity,
          parallax,
          hovered,
        },
        app,
      );

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
      applySceneState(variantName, { opacity, parallax, hovered }, app);
    };
  }, [app, hovered, opacity, parallax, resetOnUnmount, variantName]);
}
