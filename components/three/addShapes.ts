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
const PASTEL_TARGET = new THREE.Color("#ffffff");
const PASTEL_INTENSITY = 0.28;

const GRADIENT_STOPS: Record<ShapeId, readonly string[]> = {
  torusSpringAzure: [COLOR_AZURE, COLOR_SPRING],
  waveSpringLime: [COLOR_LIME, COLOR_SPRING],
  semiLimeFlamingo: [COLOR_FLAMINGO, COLOR_LIME],
  torusFlamingoLime: [COLOR_FLAMINGO, COLOR_LIME],
  semiFlamingoAzure: [COLOR_FLAMINGO, COLOR_AZURE],
  sphereFlamingoSpring: [COLOR_FLAMINGO, COLOR_SPRING],
};

const GRADIENT_AXES: Record<ShapeId, GradientAxis> = {
  torusSpringAzure: "radial",
  waveSpringLime: "y",
  semiLimeFlamingo: "radialY",
  torusFlamingoLime: "radial",
  semiFlamingoAzure: "radial",
  sphereFlamingoSpring: "y",
};

type GradientAxis = "x" | "y" | "z" | "radial" | "radialXZ" | "none" | "radialY";

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
    const color = from.clone().lerp(to, localT).lerp(PASTEL_TARGET, PASTEL_INTENSITY);
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
    roughness: 0.65,          // highlight largo, sem “faixa” estourada
    metalness: 0.05,
    clearcoat: 0.6,
    clearcoatRoughness: 0.55, // verniz suave
    sheen: 0.0,
    sheenRoughness: 0.0,
    envMapIntensity: 0.12,    // se houver envMap, deixa bem discreto
    specularIntensity: 0.45,
    specularColor: "#ffffff",
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

  const ambient = new THREE.AmbientLight(0xffffff, 0.18);
  const hemisphere = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.7); // sem ground escuro
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.35);
  keyLight.position.set(6, 8, 8);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
  fillLight.position.set(-4, 5, 6);
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
  rimLight.position.set(0, -6, -7);


  const lights: THREE.Light[] = [ambient, hemisphere, keyLight, fillLight, rimLight];

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

    const baseAmbient = isDark ? 0.38 : 1.50;
    const baseHemisphere = isDark ? 0.8 : 1.05;
    const baseKey = isDark ? 0.45 : 0.10;
    const baseFill = isDark ? 0.34 : 0.25;
    const baseRim = isDark ? 0.1 : 0.2;
    const baseEmissive = 0.0; // não vamos “tintar” com emissive


    SHAPE_ORDER.forEach((id) => {
      const material = materials[id];
      material.vertexColors = true;
      material.color.set(isDark ? "#f6f7ff" : "#ffffff");
      material.opacity = 1;
      material.transparent = false;
      material.metalness = 0.05;
      material.roughness = 0.95;
      material.clearcoat = 0.6;
      material.clearcoatRoughness = 0.55;
      material.envMapIntensity = 0.12;
      material.sheen = 0.0;
      material.sheenColor.set("#ffffff");
      material.emissive.set("#0b0b0e");
      material.emissiveIntensity = baseEmissive * currentBrightness; // 0

      material.needsUpdate = true;
    });

    ambient.color.set("#ffffff");
    ambient.intensity = baseAmbient * currentBrightness;
    hemisphere.color.set("#ffffff");
    hemisphere.groundColor.set("#ffffff");
    hemisphere.intensity = baseHemisphere * currentBrightness;
    keyLight.color.set(isDark ? "#ffffff" : "#fff3e0");
    keyLight.intensity = baseKey * currentBrightness;
    fillLight.color.set(isDark ? "#ffe9ff" : "#f2ffff");
    fillLight.intensity = baseFill * currentBrightness;
    rimLight.color.set(isDark ? "#d8e6ff" : "#ffffff");
    rimLight.intensity = baseRim * currentBrightness;
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
