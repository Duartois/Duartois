import { OrthographicCamera } from "three";

import { type GradientPalette, type ThemeName, getDefaultPalette } from "./types";

export const createCamera = () => {
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 200);
  camera.position.set(0, 0, 15);
  camera.zoom = 0.55;
  camera.updateProjectionMatrix();
  return camera;
};

export const ensurePalette = (
  palette: GradientPalette | undefined,
  theme: ThemeName,
): GradientPalette => palette ?? getDefaultPalette(theme);
