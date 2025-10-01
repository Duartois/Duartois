import * as THREE from "three";

import { loadMatcap } from "../../app/helpers/matcap";
import type { ShapeId, VariantState } from "./types";

export type ShapesHandle = {
  group: THREE.Group;
  meshes: Record<ShapeId, THREE.Mesh>;
  update: (elapsed: number) => void;
  applyVariant: (variant: VariantState) => void;
  dispose: () => void;
};

const SHAPE_ORDER: ShapeId[] = [
  "torus",
  "capsule",
  "sphere",
  "torusKnot",
  "octahedron",
];

const ROTATION_SPEEDS: Record<ShapeId, { x: number; y: number }> = {
  torus: { x: 0.0035, y: 0.0042 },
  capsule: { x: 0.00395, y: 0.0046 },
  sphere: { x: 0.0032, y: 0.0036 },
  torusKnot: { x: 0.0044, y: 0.0049 },
  octahedron: { x: 0.0038, y: 0.0041 },
};

export async function addDuartoisSignatureShapes(
  scene: THREE.Scene,
  initialVariant: VariantState,
): Promise<ShapesHandle> {
  const [mcPrimary, mcSecondary, mcAccent, mcHighlight, mcShadow] = await Promise.all([
    loadMatcap("/matcaps/aqua.png"),
    loadMatcap("/matcaps/mint.png"),
    loadMatcap("/matcaps/pink.png"),
    loadMatcap("/matcaps/lilac.png"),
    loadMatcap("/matcaps/peach.png"),
  ]);

  const group = new THREE.Group();
  scene.add(group);

  const meshes: Record<ShapeId, THREE.Mesh> = {
    torus: new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.32, 64, 96),
      new THREE.MeshMatcapMaterial({ matcap: mcPrimary, transparent: true, opacity: 0.95 }),
    ),
    capsule: new THREE.Mesh(
      new THREE.CapsuleGeometry(0.65, 1.8, 32, 48),
      new THREE.MeshMatcapMaterial({ matcap: mcSecondary, transparent: true, opacity: 0.9 }),
    ),
    sphere: new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 48, 48),
      new THREE.MeshMatcapMaterial({ matcap: mcAccent, transparent: true, opacity: 0.88 }),
    ),
    torusKnot: new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.95, 0.28, 128, 16, 2, 5),
      new THREE.MeshMatcapMaterial({ matcap: mcHighlight, transparent: true, opacity: 0.9 }),
    ),
    octahedron: new THREE.Mesh(
      new THREE.OctahedronGeometry(0.75, 1),
      new THREE.MeshMatcapMaterial({ matcap: mcShadow, transparent: true, opacity: 0.92 }),
    ),
  };

  const orderedMeshes = SHAPE_ORDER.map((id) => meshes[id]);

  orderedMeshes.forEach((mesh) => {
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
  });

  const applyVariant = (variant: VariantState) => {
    SHAPE_ORDER.forEach((id) => {
      const mesh = meshes[id];
      const target = variant[id];
      if (!target) {
        return;
      }
      mesh.position.set(...target.position);
      mesh.rotation.set(...target.rotation);
    });
  };

  applyVariant(initialVariant);

  const update = (elapsed: number) => {
    orderedMeshes.forEach((mesh, index) => {
      const id = SHAPE_ORDER[index];
      const speeds = ROTATION_SPEEDS[id];
      mesh.rotation.x += speeds.x;
      mesh.rotation.y += speeds.y;
      const wobble = 1 + 0.035 * Math.sin(elapsed * 0.78 + index * 0.6);
      mesh.scale.setScalar(wobble);
    });
  };

  const dispose = () => {
    group.parent?.remove(group);
    orderedMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      const material = mesh.material;
      const disposeMaterial = (mat: THREE.Material) => {
        if (mat instanceof THREE.MeshMatcapMaterial && mat.matcap) {
          mat.matcap.dispose();
        }
        mat.dispose();
      };
      if (Array.isArray(material)) {
        material.forEach(disposeMaterial);
      } else {
        disposeMaterial(material);
      }
    });
  };

  return { group, meshes, update, applyVariant, dispose };
}
