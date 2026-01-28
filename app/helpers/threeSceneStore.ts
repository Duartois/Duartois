"use client";

import {
  createVariantState,
  type ShapeOpacityState,
  type ThreeAppHandle,
  type ThreeAppState,
  type VariantName,
  type VariantState,
} from "@/components/three/types";

type StoredSceneState = {
  variantName: VariantName | null;
  variant: VariantState | null;
  shapeOpacity: ShapeOpacityState | null;
  opacity: number | null;
};

const storedSceneState: StoredSceneState = {
  variantName: null,
  variant: null,
  shapeOpacity: null,
  opacity: null,
};

const cloneVariant = (variant: VariantState) => createVariantState(variant);

const cloneShapeOpacity = (shapeOpacity: ShapeOpacityState) => ({
  ...shapeOpacity,
});

export const updateStoredSceneState = (partial: Partial<StoredSceneState>) => {
  if (partial.variantName) {
    storedSceneState.variantName = partial.variantName;
  }

  if (partial.variant) {
    storedSceneState.variant = cloneVariant(partial.variant);
  }

  if (partial.shapeOpacity) {
    storedSceneState.shapeOpacity = cloneShapeOpacity(partial.shapeOpacity);
  }

  if (typeof partial.opacity === "number") {
    storedSceneState.opacity = partial.opacity;
  }
};

export const getStoredSceneState = (): StoredSceneState => ({
  variantName: storedSceneState.variantName,
  variant: storedSceneState.variant ? cloneVariant(storedSceneState.variant) : null,
  shapeOpacity: storedSceneState.shapeOpacity
    ? cloneShapeOpacity(storedSceneState.shapeOpacity)
    : null,
  opacity: storedSceneState.opacity,
});

export const hasStoredSceneState = () =>
  Boolean(
    storedSceneState.variantName ||
      storedSceneState.variant ||
      storedSceneState.shapeOpacity ||
      typeof storedSceneState.opacity === "number",
  );

export const applyStoredSceneState = (
  app: ThreeAppHandle,
  overrides?: Partial<StoredSceneState>,
) => {
  const next = {
    ...storedSceneState,
    ...overrides,
  };

  const update: Partial<ThreeAppState> = {};

  if (next.variantName) {
    update.variantName = next.variantName;
  }

  if (next.variant) {
    update.variant = cloneVariant(next.variant);
  }

  if (next.shapeOpacity) {
    update.shapeOpacity = cloneShapeOpacity(next.shapeOpacity);
  }

  if (typeof next.opacity === "number") {
    update.opacity = next.opacity;
  }

  if (Object.keys(update).length > 0) {
    app.setState(update);
  }
};
