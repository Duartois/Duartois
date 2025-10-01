import * as THREE from "three";

import { loadMatcap } from "../../app/helpers/matcap";
import type { ShapeId, ThemeName, VariantState } from "./types";

export type ShapesHandle = {
  group: THREE.Group;
  meshes: Record<ShapeId, THREE.Mesh>;
  update: (elapsed: number) => void;
  applyVariant: (variant: VariantState) => void;
  applyTheme: (theme: ThemeName) => void;
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
  initialTheme: ThemeName,
): Promise<ShapesHandle> {
  const [
    mcPrimary,
    mcSecondary,
    mcAccent,
    mcHighlight,
    mcShadow,
    mcBlack,
  ] = await Promise.all([
    loadMatcap("/matcaps/aqua.png"),
    loadMatcap("/matcaps/mint.png"),
    loadMatcap("/matcaps/pink.png"),
    loadMatcap("/matcaps/lilac.png"),
    loadMatcap("/matcaps/peach.png"),
    loadMatcap("/matcaps/black.png"),
  ]);

  const lightMatcaps: Record<ShapeId, THREE.Texture> = {
    torus: mcPrimary,
    capsule: mcSecondary,
    sphere: mcAccent,
    torusKnot: mcHighlight,
    octahedron: mcShadow,
  };

  const group = new THREE.Group();
  scene.add(group);

  const meshes: Record<ShapeId, THREE.Mesh> = {
    torus: new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.32, 64, 96),
      new THREE.MeshMatcapMaterial({
        matcap: lightMatcaps.torus,
        transparent: true,
        opacity: 0.95,
      }),
    ),
    capsule: new THREE.Mesh(
      new THREE.CapsuleGeometry(0.65, 1.8, 32, 48),
      new THREE.MeshMatcapMaterial({
        matcap: lightMatcaps.capsule,
        transparent: true,
        opacity: 0.9,
      }),
    ),
    sphere: new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 48, 48),
      new THREE.MeshMatcapMaterial({
        matcap: lightMatcaps.sphere,
        transparent: true,
        opacity: 0.88,
      }),
    ),
    torusKnot: new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.95, 0.28, 128, 16, 2, 5),
      new THREE.MeshMatcapMaterial({
        matcap: lightMatcaps.torusKnot,
        transparent: true,
        opacity: 0.9,
      }),
    ),
    octahedron: new THREE.Mesh(
      new THREE.OctahedronGeometry(0.75, 1),
      new THREE.MeshMatcapMaterial({
        matcap: lightMatcaps.octahedron,
        transparent: true,
        opacity: 0.92,
      }),
    ),
  };

  const getMatcapMaterial = (mesh: THREE.Mesh) => {
    const { material } = mesh;
    if (!(material instanceof THREE.MeshMatcapMaterial)) {
      throw new Error("Expected MeshMatcapMaterial for Duartois signature shapes");
    }
    return material;
  };

  const materials: Record<ShapeId, THREE.MeshMatcapMaterial> = {
    torus: getMatcapMaterial(meshes.torus),
    capsule: getMatcapMaterial(meshes.capsule),
    sphere: getMatcapMaterial(meshes.sphere),
    torusKnot: getMatcapMaterial(meshes.torusKnot),
    octahedron: getMatcapMaterial(meshes.octahedron),
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

  const applyTheme = (theme: ThemeName) => {
    const resolveMatcap = (id: ShapeId) =>
      theme === "dark" ? mcBlack : lightMatcaps[id];

    SHAPE_ORDER.forEach((id) => {
      const material = materials[id];
      const nextMatcap = resolveMatcap(id);
      if (material.matcap !== nextMatcap) {
        material.matcap = nextMatcap;
        material.needsUpdate = true;
      }
    });
  };

  applyVariant(initialVariant);
  applyTheme(initialTheme);

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
        mat.dispose();
      };
      if (Array.isArray(material)) {
        material.forEach(disposeMaterial);
      } else {
        disposeMaterial(material);
      }
    });
  };

  return { group, meshes, update, applyVariant, applyTheme, dispose };
}
