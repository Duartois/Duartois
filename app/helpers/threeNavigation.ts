"use client";

import {
  createResponsiveVariantState,
  type VariantName,
  variantMapping,
  SHAPE_IDS,
  type ShapeId,
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
// demais → opacity: 0.3  (default de useThreeSceneSetup)
const VARIANT_OPACITY: Record<VariantName, number> = {
  home: 1,
  work: 0.3,
  about: 0.3,
  contact: 0.3,
};

/**
 * Retorna um ShapeOpacityState com todas as formas em opacity 1.
 * Garante que nenhuma opacity residual da página anterior seja herdada
 * durante a transição de navegação.
 */
const createDefaultShapeOpacity = (): Record<ShapeId, number> =>
  SHAPE_IDS.reduce(
    (acc, id) => {
      acc[id] = 1;
      return acc;
    },
    {} as Record<ShapeId, number>,
  );

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
      // Reset explícito: evita que shapeOpacity modificada (ex.: hover do Menu)
      // em uma página seja carregada na próxima.
      shapeOpacity: createDefaultShapeOpacity(),
    });
  }
};
