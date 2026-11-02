import type * as THREE from "three";
import { clamp } from "@/app/helpers/runtime/index";
import type { ShapeId } from "./types";

export type MaterialWithOpacity = THREE.Material & {
  opacity: number;
  transparent: boolean;
};

/** Below this a shape is invisible; it is skipped entirely instead of drawn at alpha 0. */
export const VISIBLE_OPACITY_THRESHOLD = 0.002;

export const hasOpacity = (
  material: THREE.Material,
): material is MaterialWithOpacity =>
  "opacity" in material && "transparent" in material;

export const applyOpacityToMaterial = (
  material: THREE.Material,
  opacity: number,
) => {
  if (!hasOpacity(material)) {
    return;
  }

  if (opacity < 1 && !material.transparent) {
    // Only needed for materials that start opaque; the scene's own materials
    // are created transparent so this never switches their shader.
    material.transparent = true;
    material.needsUpdate = true;
  }

  // Opacity itself is a plain uniform, so changing it costs nothing else.
  material.opacity = opacity;
};

export const applyOpacityToMesh = (mesh: THREE.Mesh, opacity: number) => {
  // Fully faded shapes (most of them on the inner pages) don't need a draw call.
  mesh.visible = opacity > VISIBLE_OPACITY_THRESHOLD;

  const material = mesh.material;

  if (Array.isArray(material)) {
    material.forEach((mat) => applyOpacityToMaterial(mat, opacity));
    return;
  }

  applyOpacityToMaterial(material, opacity);
};

export const updateAllMeshOpacities = (
  shapeIds: readonly ShapeId[],
  meshes: Record<ShapeId, THREE.Mesh>,
  globalOpacity: number,
  shapeOpacity: Record<ShapeId, number>,
) => {
  shapeIds.forEach((id) => {
    const mesh = meshes[id];
    const combinedOpacity = clamp(globalOpacity * shapeOpacity[id], 0, 1);
    applyOpacityToMesh(mesh, combinedOpacity);
  });
};
