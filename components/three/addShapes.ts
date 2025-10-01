import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import type {
  ShapeId,
  ThemeName,
  VariantState,
} from "./types";

export type ShapesHandle = {
  group: THREE.Group;
  meshes: Record<ShapeId, THREE.Mesh>;
  update: (elapsed: number) => void;
  applyVariant: (variant: VariantState) => void;
  applyTheme: (theme: ThemeName) => void;
  setBrightness: (value: number) => void;
  dispose: () => void;
};

const SHAPE_ORDER: ShapeId[] = [
  "torusSpringAzure",
  "waveSpringLime",
  "semiLimeFlamingo",
  "torusFlamingoLime",
  "semiFlamingoAzure",
  "sphereFlamingoSpring",
];


const ROTATION_SPEEDS: Record<ShapeId, { x: number; y: number }> = {
  torusSpringAzure: { x: 0.0035, y: 0.0042 },
  waveSpringLime: { x: 0.0026, y: 0.0034 },
  semiLimeFlamingo: { x: 0.0032, y: 0.0039 },
  torusFlamingoLime: { x: 0.0037, y: 0.0044 },
  semiFlamingoAzure: { x: 0.0031, y: 0.0038 },
  sphereFlamingoSpring: { x: 0.0028, y: 0.0031 },
};

const COLOR_SPRING = "#71ff81";
const COLOR_AZURE = "#85b9ff";
const COLOR_LIME = "#f0ff66";
const COLOR_FLAMINGO = "#ff5c82";
const DARK_THEME_COLOR = "#2b2b33";

const GRADIENT_STOPS: Record<ShapeId, readonly string[]> = {
  torusSpringAzure: [COLOR_SPRING, COLOR_AZURE],
  waveSpringLime: [COLOR_SPRING, COLOR_LIME],
  semiLimeFlamingo: [COLOR_LIME, COLOR_FLAMINGO],
  torusFlamingoLime: [COLOR_FLAMINGO, COLOR_LIME],
  semiFlamingoAzure: [COLOR_FLAMINGO, COLOR_AZURE],
  sphereFlamingoSpring: [COLOR_FLAMINGO, COLOR_SPRING],
};

const GRADIENT_AXES: Record<ShapeId, GradientAxis> = {
  torusSpringAzure: "radial",
  waveSpringLime: "z",
  semiLimeFlamingo: "y",
  torusFlamingoLime: "radial",
  semiFlamingoAzure: "y",
  sphereFlamingoSpring: "y",
};

type GradientAxis = "x" | "y" | "z" | "radial";

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

  let min = Infinity;
  let max = -Infinity;

  const readComponent = (
    attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
    index: number,
  ) => {
    if (axis === "x") {
      return attribute.getX(index);
    }
    if (axis === "y") {
      return attribute.getY(index);
    }
    if (axis === "z") {
      return attribute.getZ(index);
    }

    const x = attribute.getX(index);
    const z = attribute.getZ(index);
    return Math.hypot(x, z);
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

const createGlossyMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.24,
    metalness: 0.14,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
  });

const THICKNESS = 0.64;
const TORUS_RADIUS = 1.28;
const TORUS_RADIAL_SEGMENTS = 128;
const TORUS_TUBULAR_SEGMENTS = 220;
const CAP_SEGMENTS = 64;

class CircularArcCurve extends THREE.Curve<THREE.Vector3> {
  public constructor(
    private readonly radius: number,
    private readonly arc: number,
    private readonly startAngle = -arc / 2,
  ) {
    super();
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const theta = this.startAngle + this.arc * t;
    const x = Math.cos(theta) * this.radius;
    const z = Math.sin(theta) * this.radius;
    target.set(x, 0, z);
    return target;
  }
}

class WaveCurve extends THREE.Curve<THREE.Vector3> {
  private readonly halfLength: number;

  public constructor(private readonly length: number, private readonly amplitude: number) {
    super();
    this.halfLength = length / 2;
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const x = THREE.MathUtils.lerp(-this.halfLength, this.halfLength, t);
    const waveT = (t - 0.5) * Math.PI * 2;
    const y = Math.sin(waveT) * this.amplitude;
    const z = Math.cos(waveT) * this.amplitude * 0.4;
    target.set(x, y, z);
    return target;
  }
}


const createRoundedTubeGeometry = (
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radialSegments: number,
) => {
  const tube = new THREE.TubeGeometry(curve, tubularSegments, THICKNESS, radialSegments, false);
  const capOrigin = new THREE.SphereGeometry(THICKNESS, CAP_SEGMENTS, CAP_SEGMENTS);

  const startPoint = curve.getPoint(0);
  const endPoint = curve.getPoint(1);

  const startCap = capOrigin.clone();
  startCap.translate(startPoint.x, startPoint.y, startPoint.z);

  const endCap = capOrigin.clone();
  endCap.translate(endPoint.x, endPoint.y, endPoint.z);

  const merged = mergeGeometries([tube, startCap, endCap], true);

  capOrigin.dispose();

  if (!merged) {
    startCap.dispose();
    endCap.dispose();
    return tube;
  }

  tube.dispose();
  startCap.dispose();
  endCap.dispose();

  return merged;
};

const createPartialTorusGeometry = (arc: number) =>
  createRoundedTubeGeometry(
    new CircularArcCurve(TORUS_RADIUS, arc),
    TORUS_TUBULAR_SEGMENTS,
    TORUS_RADIAL_SEGMENTS,
  );


export async function addDuartoisSignatureShapes(
  scene: THREE.Scene,
  initialVariant: VariantState,
  initialTheme: ThemeName,
): Promise<ShapesHandle> {
  const group = new THREE.Group();
  scene.add(group);
  group.scale.setScalar(1.2);

  const waveCurve = new WaveCurve(3.8, 0.4);

  const meshes: Record<ShapeId, THREE.Mesh> = {
    torusSpringAzure: new THREE.Mesh(
      applyGradientToGeometry(
        createPartialTorusGeometry((3 * Math.PI) / 2),
        GRADIENT_STOPS.torusSpringAzure,
        GRADIENT_AXES.torusSpringAzure,
      ),
      createGlossyMaterial(),
    ),
    waveSpringLime: new THREE.Mesh(
      applyGradientToGeometry(
        createRoundedTubeGeometry(waveCurve, 280, 88),
        GRADIENT_STOPS.waveSpringLime,
        GRADIENT_AXES.waveSpringLime,
      ),
      createGlossyMaterial(),
    ),
    semiLimeFlamingo: new THREE.Mesh(
      applyGradientToGeometry(
        createPartialTorusGeometry(Math.PI),
        GRADIENT_STOPS.semiLimeFlamingo,
        GRADIENT_AXES.semiLimeFlamingo,
      ),
      createGlossyMaterial(),
    ),
    torusFlamingoLime: new THREE.Mesh(
      applyGradientToGeometry(
        createPartialTorusGeometry((3 * Math.PI) / 2),
        GRADIENT_STOPS.torusFlamingoLime,
        GRADIENT_AXES.torusFlamingoLime,
      ),
      createGlossyMaterial(),
    ),
    semiFlamingoAzure: new THREE.Mesh(
      applyGradientToGeometry(
        createPartialTorusGeometry(Math.PI),
        GRADIENT_STOPS.semiFlamingoAzure,
        GRADIENT_AXES.semiFlamingoAzure,
      ),
      createGlossyMaterial(),
    ),
    sphereFlamingoSpring: new THREE.Mesh(
      applyGradientToGeometry(
        new THREE.SphereGeometry(THICKNESS, 96, 96),
        GRADIENT_STOPS.sphereFlamingoSpring,
        GRADIENT_AXES.sphereFlamingoSpring,
      ),
      createGlossyMaterial(),
    ),
  };

  const materials: Record<ShapeId, THREE.MeshPhysicalMaterial> = {
    torusSpringAzure: meshes.torusSpringAzure
      .material as THREE.MeshPhysicalMaterial,
    waveSpringLime: meshes.waveSpringLime.material as THREE.MeshPhysicalMaterial,
    semiLimeFlamingo: meshes.semiLimeFlamingo
      .material as THREE.MeshPhysicalMaterial,
    torusFlamingoLime: meshes.torusFlamingoLime
      .material as THREE.MeshPhysicalMaterial,
    semiFlamingoAzure: meshes.semiFlamingoAzure
      .material as THREE.MeshPhysicalMaterial,
    sphereFlamingoSpring: meshes.sphereFlamingoSpring
      .material as THREE.MeshPhysicalMaterial,
  };

  const orderedMeshes = SHAPE_ORDER.map((id) => meshes[id]);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(3.6, 4.2, 5.4);

  const fillLight = new THREE.PointLight(0xfff1d6, 0.8, 18);
  fillLight.position.set(-4.2, 2.1, 3.8);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
  rimLight.position.set(-3.4, -2.8, -4.6);

  const ambient = new THREE.AmbientLight(0xffffff, 0.58);

  const lights: THREE.Light[] = [keyLight, fillLight, rimLight, ambient];

  orderedMeshes.forEach((mesh) => {
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
  });

  lights.forEach((light) => {
    group.add(light);
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
      if (Array.isArray(target.scale)) {
        mesh.scale.set(...target.scale);
      } else {
        mesh.scale.setScalar(target.scale ?? 1);
      }
    });
  };

  let currentTheme: ThemeName = initialTheme;
  let currentBrightness = 1;

  const applyTheme = (theme: ThemeName) => {
    currentTheme = theme;
    const isDark = theme === "dark";

    const baseKey = isDark ? 2.4 : 1.8;
    const baseFill = isDark ? 1.25 : 1.0;
    const baseRim = isDark ? 1.5 : 1.1;
    const baseAmbient = isDark ? 0.5 : 0.66;
    const baseEmissive = isDark ? 0.26 : 0.12;

    SHAPE_ORDER.forEach((id) => {
      const material = materials[id];
      material.vertexColors = !isDark;
      material.color.set(isDark ? DARK_THEME_COLOR : 0xffffff);
      material.opacity = 1;
      material.transparent = false;
      material.metalness = isDark ? 0.1 : 0.14;
      material.roughness = isDark ? 0.32 : 0.24;
      material.clearcoat = isDark ? 0.5 : 0.65;
      material.clearcoatRoughness = isDark ? 0.22 : 0.18;
      material.emissive.set(isDark ? "#1a1a23" : "#0d1010");
      material.emissiveIntensity = baseEmissive * currentBrightness;
      material.needsUpdate = true;
    });

    keyLight.color.set(isDark ? "#e1e7ff" : "#ffffff");
    keyLight.intensity = baseKey * currentBrightness;

    fillLight.color.set(isDark ? "#7cb8ff" : "#fff1d6");
    fillLight.intensity = baseFill * currentBrightness;

    rimLight.color.set(isDark ? "#8ae2ff" : "#ffffff");
    rimLight.intensity = baseRim * currentBrightness;

    ambient.color.set(isDark ? "#262630" : "#ffffff");
    ambient.intensity = baseAmbient * currentBrightness;
  };

  const setBrightness = (value: number) => {
    if (value === currentBrightness) {
      return;
    }
    currentBrightness = value;
    applyTheme(currentTheme);
  };

  applyVariant(initialVariant);
  applyTheme(initialTheme);

  const update = () => {};

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

    lights.forEach((light) => {
      group.remove(light);
      if (typeof light.dispose === "function") {
        light.dispose();
      }
    });
  };

  return {
    group,
    meshes,
    update,
    applyVariant,
    applyTheme,
    setBrightness,
    dispose,
  };
}
