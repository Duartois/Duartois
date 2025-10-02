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


const COLOR_SPRING = "#91faca";
const COLOR_AZURE = "#8ec2ff";
const COLOR_LIME = "#fef9a9";
const COLOR_FLAMINGO = "#ff9fd3";
const createGradientStops = (from: string, to: string): readonly string[] => {
  const start = new THREE.Color(from);
  const end = new THREE.Color(to);
  const firstStop = start.clone().lerp(end, 1 / 3);
  const secondStop = start.clone().lerp(end, 2 / 3);

  return [start, firstStop, secondStop, end].map(
    (color) => `#${color.getHexString()}`,
  );
};

const GRADIENT_STOPS: Record<ShapeId, readonly string[]> = {
  torusSpringAzure: createGradientStops(COLOR_SPRING, COLOR_AZURE),
  waveSpringLime: createGradientStops(COLOR_SPRING, COLOR_LIME),
  semiLimeFlamingo: createGradientStops(COLOR_LIME, COLOR_FLAMINGO),
  torusFlamingoLime: createGradientStops(COLOR_FLAMINGO, COLOR_LIME),
  semiFlamingoAzure: createGradientStops(COLOR_FLAMINGO, COLOR_AZURE),
  sphereFlamingoSpring: createGradientStops(COLOR_FLAMINGO, COLOR_SPRING),
};

const GRADIENT_AXES: Record<ShapeId, GradientAxis> = {
  torusSpringAzure: "radial",
  waveSpringLime: "y",
  semiLimeFlamingo: "radial",
  torusFlamingoLime: "radial",
  semiFlamingoAzure: "radial",
  sphereFlamingoSpring: "y",
};

/**
 * Gradient axis descriptors:
 * - "radial": distance from the origin in 3D space (sqrt(x^2 + y^2 + z^2)).
 * - "y": uses the Y component to drive the gradient.
 */
type GradientAxis = "radial" | "y";

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

  const values = new Float32Array(position.count);
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < position.count; i += 1) {
    const value =
      axis === "y"
        ? position.getY(i)
        : Math.hypot(position.getX(i), position.getY(i), position.getZ(i));
    values[i] = value;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  const range = max - min || 1;
  const stopColors = stops.map((hex) => new THREE.Color(hex));
  const colors = new Float32Array(position.count * 3);

  for (let i = 0; i < position.count; i += 1) {
    const value = values[i];
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
    roughness: 0.3, // mantém highlights definidos
    metalness: 0.18,
    clearcoat: 0.82,
    clearcoatRoughness: 0.28,
    sheen: 0.0,
    sheenRoughness: 0.0,
    envMapIntensity: 0.85, // dá brilho perceptível quando houver envMap
    specularIntensity: 0.58,
    specularColor: "#ffffff",
  });

const createFlatMaterial = () =>
  new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });


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

  const geometryFactories: Record<ShapeId, () => THREE.BufferGeometry> = {
    torusSpringAzure: () => createPartialTorusGeometry((3 * Math.PI) / 2),
    waveSpringLime: () => createRoundedTubeGeometry(waveCurve, 280, 88),
    semiLimeFlamingo: () => createPartialTorusGeometry(Math.PI),
    torusFlamingoLime: () => createPartialTorusGeometry((3 * Math.PI) / 2),
    semiFlamingoAzure: () => createPartialTorusGeometry(Math.PI),
    sphereFlamingoSpring: () => new THREE.SphereGeometry(THICKNESS, 96, 96),
  };

  const meshes = SHAPE_ORDER.reduce<Record<ShapeId, THREE.Mesh>>((acc, id) => {
    const geometry = applyGradientToGeometry(
      geometryFactories[id](),
      GRADIENT_STOPS[id],
      GRADIENT_AXES[id],
    );
    acc[id] = new THREE.Mesh(geometry, createGlossyMaterial());
    return acc;
  }, {} as Record<ShapeId, THREE.Mesh>);

  const materials = SHAPE_ORDER.reduce<
    Record<ShapeId, { physical: THREE.MeshPhysicalMaterial; flat: THREE.MeshBasicMaterial }>
  >((acc, id) => {
    acc[id] = {
      physical: meshes[id].material as THREE.MeshPhysicalMaterial,
      flat: createFlatMaterial(),
    };
    return acc;
  }, {} as Record<
    ShapeId,
    { physical: THREE.MeshPhysicalMaterial; flat: THREE.MeshBasicMaterial }
  >);

  const originalColorAttributes = SHAPE_ORDER.reduce<
    Record<ShapeId, { array: Float32Array; itemSize: number; normalized: boolean } | null>
  >((acc, id) => {
    const attribute = meshes[id].geometry.getAttribute("color");
    acc[id] = attribute
      ? {
          array: new Float32Array(attribute.array as ArrayLike<number>),
          itemSize: attribute.itemSize,
          normalized: attribute.normalized,
        }
      : null;
    return acc;
  }, {} as Record<
    ShapeId,
    { array: Float32Array; itemSize: number; normalized: boolean } | null
  >);

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

    const baseEmissive = 0.0; // não vamos “tintar” com emissive

    SHAPE_ORDER.forEach((id) => {
      const { physical, flat } = materials[id];
      const mesh = meshes[id];
      if (isDark) {
        if (mesh.material !== physical) {
          mesh.material = physical;
        }
        physical.vertexColors = false;
        physical.color.set("#2b2b33");
        physical.opacity = 1;
        physical.transparent = false;
        physical.metalness = 0.22;
        physical.roughness = 0.34;
        physical.clearcoat = 0.88;
        physical.clearcoatRoughness = 0.32;
        physical.envMapIntensity = 0.95;
        physical.specularIntensity = 0.62;
        physical.sheen = 0.0;
        physical.sheenColor.set("#ffffff");
        physical.emissive.set("#0b0b0e");
        physical.emissiveIntensity = baseEmissive * currentBrightness; // 0
        physical.needsUpdate = true;
      } else {
        if (mesh.material !== flat) {
          mesh.material = flat;
        }
        flat.vertexColors = true;
        flat.color.set("#ffffff");
        const original = originalColorAttributes[id];
        if (original) {
          mesh.geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(
              original.array.slice(),
              original.itemSize,
            )
          );
        }
        flat.opacity = 1;
        flat.transparent = false;
        flat.needsUpdate = true;
      }
    });

    const darkLightSettings = {
      ambient: 0.38,
      hemisphere: 0.8,
      key: 0.45,
      fill: 0.34,
      rim: 0.1,
    } as const;

    const lightLightSettings = {
      ambient: 1.5,
      hemisphere: 0,
      key: 0,
      fill: 0,
      rim: 0,
    } as const;

    const lightSettings = isDark ? darkLightSettings : lightLightSettings;

    ambient.color.set("#ffffff");
    ambient.intensity = lightSettings.ambient * currentBrightness;
    hemisphere.color.set("#ffffff");
    hemisphere.groundColor.set("#ffffff");
    hemisphere.intensity = lightSettings.hemisphere * currentBrightness;
    keyLight.color.set(isDark ? "#ffffff" : "#fff3e0");
    keyLight.intensity = lightSettings.key * currentBrightness;
    fillLight.color.set(isDark ? "#ffe9ff" : "#f2ffff");
    fillLight.intensity = lightSettings.fill * currentBrightness;
    rimLight.color.set(isDark ? "#d8e6ff" : "#ffffff");
    rimLight.intensity = lightSettings.rim * currentBrightness;
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

  const dispose = () => {
    group.parent?.remove(group);
    orderedMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
    });

    const uniqueMaterials = new Set<THREE.Material>();
    Object.values(materials).forEach(({ physical, flat }) => {
      uniqueMaterials.add(physical);
      uniqueMaterials.add(flat);
    });
    uniqueMaterials.forEach((material) => {
      material.dispose();
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
    applyVariant,
    applyTheme,
    setBrightness,
    dispose,
  };
}
