"use client";

import {
  createResponsiveVariantState,
  type VariantName,
  variantMapping,
  getVariantShapeBlur,
  getVariantShapeOpacity,
} from "@/components/three/types";

export const resolveVariantFromPath = (
  pathname: string,
): VariantName | null => {
  if (pathname === "/") {
    return "home";
  }

  if (pathname === "/work") {
    return "work";
  }
  if (pathname.startsWith("/work/")) {
    return "projectDetail";
  }
  if (pathname.startsWith("/about")) {
    return "about";
  }

  if (pathname.startsWith("/contact")) {
    return "contact";
  }

  return null;
};

// Cada variante tem seu próprio opacity — espelha os valores passados
// para useThreeSceneSetup em cada page.tsx.
// home → opacity: 1  (app/page.tsx: useThreeSceneSetup("home", { opacity: 1 }))
// demais → opacity: 1  (sem escurecimento global)
const VARIANT_OPACITY: Record<VariantName, number> = {
  home: 1,
  work: 1,
  about: 1,
  projectDetail: 1,
  contact: 1,
};

export const applyNavigationSceneVariant = (pathname: string) => {
  if (typeof window === "undefined") {
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

  if (window.__THREE_APP__) {
    window.__THREE_APP__.setState({
      variant: responsiveVariant,
      opacity: VARIANT_OPACITY[variantName],
      shapeOpacity: getVariantShapeOpacity(responsiveVariant),
      shapeBlur: getVariantShapeBlur(responsiveVariant),
    });
  }
};
