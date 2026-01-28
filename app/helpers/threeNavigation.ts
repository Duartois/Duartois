"use client";

import {
  createResponsiveVariantState,
  type VariantName,
  variantMapping,
} from "@/components/three/types";
import { applyStoredSceneState, updateStoredSceneState } from "./threeSceneStore";
import { getThreeAppInstance } from "./threeAppStore";

export const resolveVariantFromPath = (pathname: string): VariantName | null => {
  if (pathname === "/") {
    return "home";
  }

  if (pathname.startsWith("/work")) {
    return "work";
  }

  if (pathname.startsWith("/about")) {
    return "about";
  }

  if (pathname.startsWith("/contact")) {
    return "contact";
  }

  return null;
};

export const applyNavigationSceneVariant = (pathname: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const app = getThreeAppInstance();
  if (!app) {
    const variantName = resolveVariantFromPath(pathname);
    if (!variantName) {
      return;
    }

    const responsiveVariant = createResponsiveVariantState(
      variantMapping[variantName],
      window.innerWidth,
      window.innerHeight,
    );

    updateStoredSceneState({
      variantName,
      variant: responsiveVariant,
    });
    return;
  }

  const variantName = resolveVariantFromPath(pathname);
  if (!variantName) {
    return;
  }

  const responsiveVariant = createResponsiveVariantState(
    variantMapping[variantName],
    window.innerWidth,
    window.innerHeight,
  );

  updateStoredSceneState({
    variantName,
    variant: responsiveVariant,
  });

  applyStoredSceneState(app, {
    variantName,
    variant: responsiveVariant,
  });
};
