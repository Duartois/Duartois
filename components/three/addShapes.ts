import * as THREE from "three";

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

const DUARTOIS_GRADIENT = ["#ff6bc2", "#89d9ff", "#78ff81", "#f1ff6b"] as const;

type GradientAxis = "x" | "y" | "z";

const applyGradientToGeometry = (
  geometry: THREE.BufferGeometry,
  stops: readonly string[],
  axis: GradientAxis,
): THREE.BufferGeometry => {
  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
  if (nonIndexed !== geometry) {
    geometry.dispose();
  }
  const position = nonIndexed.getAttribute("position");

  if (!position) {
    return nonIndexed;
  }

  const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;
  let min = Infinity;
  let max = -Infinity;

  const readComponent = (attribute: THREE.BufferAttribute, index: number) => {
    switch (axisIndex) {
      case 0:
        return attribute.getX(index);
      case 1:
        return attribute.getY(index);
      default:
        return attribute.getZ(index);
    }
  };

  for (let i = 0; i < position.count; i += 1) {
    const value = readComponent(position, i);
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  const range = max - min || 1;
  const stopColors = stops.map((hex) => new THREE.Color(hex));
  const colors = new Float32Array(position.count * 3);

  for (let i = 0; i < position.count; i += 1) {
    const value = readComponent(position, i);
    const t = (value - min) / range;
    const scaled = t * (stopColors.length - 1);
    const index = Math.floor(scaled);
    const nextIndex = Math.min(stopColors.length - 1, index + 1);
    const localT = scaled - index;
    const from = stopColors[index];
    const to = stopColors[nextIndex];
    const color = from.clone().lerp(to, localT);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  nonIndexed.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return nonIndexed;
};

const createGradientMaterial = (opacity: number) =>
  new THREE.MeshBasicMaterial({
    transparent: true,
    opacity,
    vertexColors: true,
  });

export async function addDuartoisSignatureShapes(
  scene: THREE.Scene,
  initialVariant: VariantState,
  initialTheme: ThemeName,
): Promise<ShapesHandle> {
  const group = new THREE.Group();
  scene.add(group);

  const meshes: Record<ShapeId, THREE.Mesh> = {
    torus: new THREE.Mesh(
      applyGradientToGeometry(
        new THREE.TorusGeometry(1.55, 0.42, 96, 128),
        DUARTOIS_GRADIENT,
        "x",
      ),
      createGradientMaterial(0.94),
    ),
    capsule: new THREE.Mesh(
      applyGradientToGeometry(
        new THREE.CapsuleGeometry(0.78, 2.1, 48, 64),
        DUARTOIS_GRADIENT,
        "y",
      ),
      createGradientMaterial(0.9),
    ),
    sphere: new THREE.Mesh(
      applyGradientToGeometry(
        new THREE.SphereGeometry(1.0, 64, 64),
        DUARTOIS_GRADIENT,
        "y",
      ),
      createGradientMaterial(0.92),
    ),
    torusKnot: new THREE.Mesh(
      applyGradientToGeometry(
        new THREE.TorusKnotGeometry(1.1, 0.33, 160, 24, 2, 5),
        DUARTOIS_GRADIENT,
        "x",
      ),
      createGradientMaterial(0.92),
    ),
    octahedron: new THREE.Mesh(
      applyGradientToGeometry(
        new THREE.OctahedronGeometry(0.92, 2),
        DUARTOIS_GRADIENT,
        "y",
      ),
      createGradientMaterial(0.9),
    ),
  };

  const materials: Record<ShapeId, THREE.MeshBasicMaterial> = {
    torus: meshes.torus.material as THREE.MeshBasicMaterial,
    capsule: meshes.capsule.material as THREE.MeshBasicMaterial,
    sphere: meshes.sphere.material as THREE.MeshBasicMaterial,
    torusKnot: meshes.torusKnot.material as THREE.MeshBasicMaterial,
    octahedron: meshes.octahedron.material as THREE.MeshBasicMaterial,
  };

  const baseOpacities: Record<ShapeId, number> = {
    torus: 0.94,
    capsule: 0.9,
    sphere: 0.92,
    torusKnot: 0.92,
    octahedron: 0.9,
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
    SHAPE_ORDER.forEach((id) => {
      const material = materials[id];
      const base = baseOpacities[id];
      const targetOpacity = theme === "dark" ? Math.min(1, base + 0.05) : base;
      material.opacity = targetOpacity;
      material.transparent = targetOpacity < 1;
      material.needsUpdate = true;
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
