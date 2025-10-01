import { OrthographicCamera } from "three";

import {
  type GradientPalette,
  type ThemeName,
  type VariantState,
  createVariantState,
  getDefaultPalette,
} from "./types";

export const createCamera = () => {
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 50);
  camera.position.set(0, 0, 6);
  return camera;
};

export const cloneVariant = (variant: VariantState) => createVariantState(variant);

export const ensurePalette = (
  palette: GradientPalette | undefined,
  theme: ThemeName,
): GradientPalette => palette ?? getDefaultPalette(theme);
