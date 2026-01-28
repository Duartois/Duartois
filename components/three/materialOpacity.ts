import type * as THREE from "three";
import { clamp } from "@/app/helpers/runtime/math";
import type { ShapeId } from "./types";

export type MaterialWithOpacity = THREE.Material & {
  opacity: number;
  transparent: boolean;
};

export const hasOpacity = (
  material: THREE.Material,
): material is MaterialWithOpacity => "opacity" in material && "transparent" in material;

export const applyOpacityToMaterial = (
  material: THREE.Material,
  opacity: number,
) => {
  if (!hasOpacity(material)) {
    return;
  }

  material.opacity = opacity;
  material.transparent = opacity < 1 ? true : material.transparent;
  material.needsUpdate = true;
};

export const applyOpacityToMesh = (mesh: THREE.Mesh, opacity: number) => {
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
