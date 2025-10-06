import * as THREE from "three";

const mergeGeometries = (
  geometries: THREE.BufferGeometry[],
  useGroups = false,
): THREE.BufferGeometry | null => {
  if (geometries.length === 0) {
    return null;
  }

  const processedGeometries = geometries.map((geometry) =>
    geometry.index ? geometry.toNonIndexed() : geometry,
  );

  const disposeProcessedClones = () => {
    processedGeometries.forEach((processed, index) => {
      if (processed !== geometries[index]) {
        processed.dispose();
      }
    });
  };

  const attributeInfos = new Map<
    string,
    {
      arrayType: { new (size: number): any };
      itemSize: number;
      normalized: boolean;
      totalLength: number;
      arrays: ArrayLike<number>[];
    }
  >();

  for (const geometry of processedGeometries) {
    const attributes = geometry.attributes as Record<string, THREE.BufferAttribute>;
    for (const name of Object.keys(attributes)) {
      const attribute = attributes[name];

      if (!attributeInfos.has(name)) {
        attributeInfos.set(name, {
          arrayType: attribute.array.constructor as {
            new (size: number): any;
          },
          itemSize: attribute.itemSize,
          normalized: attribute.normalized,
          totalLength: attribute.array.length,
          arrays: [attribute.array],
        });
        continue;
      }

      const info = attributeInfos.get(name)!;

      if (
        info.itemSize !== attribute.itemSize ||
        info.normalized !== attribute.normalized ||
        info.arrayType !==
          (attribute.array.constructor as { new (size: number): any })
      ) {
        disposeProcessedClones();
        return null;
      }

      info.totalLength += attribute.array.length;
      info.arrays.push(attribute.array);
    }
  }

  for (const info of attributeInfos.values()) {
    if (info.arrays.length !== processedGeometries.length) {
      disposeProcessedClones();
      return null;
    }
  }

  const mergedGeometry = new THREE.BufferGeometry();

  attributeInfos.forEach((info, name) => {
    const mergedArray = new info.arrayType(info.totalLength);
    let offset = 0;
    for (const array of info.arrays) {
      mergedArray.set(array, offset);
      offset += array.length;
    }

    const attribute = new THREE.BufferAttribute(
      mergedArray,
      info.itemSize,
      info.normalized,
    );
    mergedGeometry.setAttribute(name, attribute);
  });

  if (useGroups) {
    let groupStart = 0;
    processedGeometries.forEach((geometry, index) => {
      const position = geometry.getAttribute("position");
      if (!position) {
        return;
      }
      const count = position.count;
      mergedGeometry.addGroup(groupStart, count, index);
      groupStart += count;
    });
  }

  disposeProcessedClones();

  return mergedGeometry;
};

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

  // Garantimos limites atualizados para evitar que o Three.js oculte a malha ao
  // aplicar frustum culling com dados desatualizados.
  nonIndexed.computeBoundingBox();
  nonIndexed.computeBoundingSphere();

  return nonIndexed;
};

const createGlossyMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.012, // deixa o brilho suave, mas presente
    metalness: 0.05,
    clearcoat: 0.014,
    clearcoatRoughness: 0.016,
    sheen: 0.14,
    sheenRoughness: 0.38,
    envMapIntensity: 0.15,
    specularIntensity: 0.14,
    specularColor: "#f5f7ff",
    ior: 1.45,
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
    this.halfLength = length / 1.5;
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const x = THREE.MathUtils.lerp(-this.halfLength, this.halfLength, t);
    const waveT = (t - 0.5) * Math.PI * 2.5;
    const y = 0;
    const z = Math.sin(waveT) * this.amplitude;
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
    const mesh = new THREE.Mesh(geometry, createGlossyMaterial());
    // As geometrias são atualizadas manualmente, então desativamos o frustum
    // culling para impedir que desapareçam caso o bounding volume fique
    // incorreto após alguma atualização.
    mesh.frustumCulled = false;
    acc[id] = mesh;
    return acc;
  }, {} as Record<ShapeId, THREE.Mesh>);

  const materials = SHAPE_ORDER.reduce<Record<ShapeId, THREE.MeshPhysicalMaterial>>(
    (acc, id) => {
      acc[id] = meshes[id].material as THREE.MeshPhysicalMaterial;
      return acc;
    },
    {} as Record<ShapeId, THREE.MeshPhysicalMaterial>,
  );

  const orderedMeshes = SHAPE_ORDER.map((id) => meshes[id]);

  const ambient = new THREE.AmbientLight(0xffffff, 0.18);
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.35);
  keyLight.position.set(6, 8, 8);

  const rimLight = new THREE.DirectionalLight(0x9cc7ff, 0.5);
  rimLight.position.set(-4, 5, -6);

  const lights: THREE.Light[] = [ambient, keyLight, rimLight];

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
  let currentBrightness = 1.5;

  const applyTheme = (theme: ThemeName) => {
    currentTheme = theme;
    const isDark = theme === "dark";

    const baseEmissive = isDark ? 0.012 : 0.04;

    SHAPE_ORDER.forEach((id) => {
      const material = materials[id];
      const mesh = meshes[id];
      if (mesh.material !== material) {
        mesh.material = material;
      }

      material.vertexColors = true;
      material.color.set(isDark ? "#1b1d28" : "#f6f7ff");
      material.opacity = 1;
      material.transparent = false;
      material.metalness = isDark ? 0.008 : 0.005;
      material.roughness = isDark ? 0.26 : 0.3;
      material.clearcoat = isDark ? 0.018 : 0.14;
      material.clearcoatRoughness = isDark ? 0.02 : 0.016;
      material.envMapIntensity = isDark ? 0.02 : 0.08;
      material.specularIntensity = isDark ? 0.02 : 0.024;
      material.sheen = 0.18;
      material.sheenColor.set(isDark ? "#e6e9ff" : "#ffffff");
      material.emissive.set(isDark ? "#090a13" : "#fafbff");
      material.emissiveIntensity = baseEmissive * currentBrightness;
      material.needsUpdate = true;
    });

    const darkLightSettings = {
      ambient: 0.46,
      key: 0.58,
      rim: 0.32,
    } as const;

    const lightLightSettings = {
      ambient: 1.12,
      key: 0.42,
      rim: 0.28,
    } as const;

    const lightSettings = isDark ? darkLightSettings : lightLightSettings;

    ambient.color.set("#ffffff");
    ambient.intensity = lightSettings.ambient * currentBrightness;
    keyLight.color.set(isDark ? "#ffffff" : "#ffe9d2");
    keyLight.intensity = lightSettings.key * currentBrightness;
    rimLight.color.set(isDark ? "#9cc7ff" : "#cde2ff");
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
    Object.values(materials).forEach((material) => {
      uniqueMaterials.add(material);
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