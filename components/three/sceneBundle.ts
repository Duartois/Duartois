import * as THREE from "three";
import {
  attachToWindow,
  detachFromWindow,
  dispatchReady,
  dispatchStateChange,
  createStateSnapshot,
} from "./debug-helpers";
import {
  DEFAULT_BRIGHTNESS,
  type GradientPalette,
  type ShapeId,
  type StateUpdater,
  type ThreeAppHandle,
  type ThreeAppState,
  type ThemeName,
  type VariantName,
  type VariantState,
  createVariantState,
  createResponsiveVariantState,
  getDefaultPalette,
  variantMapping,
} from "./types";
import { createCamera, ensurePalette } from "./factories";
import { getWindow } from "@/app/helpers/runtime/browser";
import { clamp } from "@/app/helpers/runtime/math";
import { updateAllMeshOpacities } from "./materialOpacity";
import { getPointerTargetVector } from "./pointerDriver";
import { getThreeAppInstance } from "@/app/helpers/threeAppStore";

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

  // ✅ Em vez de Sphere inteira, usamos HEMISFÉRIO (metade da esfera)
  // SphereGeometry params: (r, wSeg, hSeg, phiStart, phiLen, thetaStart, thetaLen)
  // thetaStart = PI/2, thetaLen = PI/2 => "meia esfera" (metade de baixo), com a "boca" virada para +Y.
  const hemiOrigin = new THREE.SphereGeometry(
    THICKNESS,
    CAP_SEGMENTS,
    CAP_SEGMENTS,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI / 2,
  );

  const startPoint = curve.getPoint(0);
  const endPoint = curve.getPoint(1);

  // tangente aponta na direção do "caminho" do tubo
  const tStart = curve.getTangent(0).normalize();      // direção para dentro do tubo no início
  const tEnd = curve.getTangent(1).normalize();        // direção para fora no final

  const up = new THREE.Vector3(0, 1, 0);

  // No hemisfério "de baixo", a boca está voltada para +Y
  // Então alinhamos +Y com a direção desejada
  const qStart = new THREE.Quaternion().setFromUnitVectors(up, tStart);
  const qEnd = new THREE.Quaternion().setFromUnitVectors(up, tEnd.clone().multiplyScalar(-1));

  const startCap = hemiOrigin.clone();
  startCap.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(qStart));
  startCap.translate(startPoint.x, startPoint.y, startPoint.z);

  const endCap = hemiOrigin.clone();
  endCap.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(qEnd));
  endCap.translate(endPoint.x, endPoint.y, endPoint.z);

  const merged = mergeGeometries([tube, startCap, endCap], true);

  hemiOrigin.dispose();

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
    mesh.name = id;
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

      if (isDark) {
        material.vertexColors = false;
        material.color.set("#4a4d57");
      } else {
        material.vertexColors = true;
        material.color.set("#f6f7ff");
      }
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

export type InitSceneOptions = {
  canvas: HTMLCanvasElement;
  initialVariant?: VariantName;
  theme: ThemeName;
  palette?: GradientPalette;
  parallax?: boolean;
};

const getToneMappingExposure = (theme: ThemeName) =>
  theme === "light" ? 1.1 : 1.5;

const initScene = async ({
  canvas,
  initialVariant = "home",
  theme,
  palette,
  parallax = true,
}: InitSceneOptions): Promise<ThreeAppHandle> => {
  const globalWindow = getWindow();

  if (!globalWindow) {
    throw new Error("initScene requires a browser environment");
  }

  getThreeAppInstance()?.dispose();

  const mobileQuery = globalWindow.matchMedia("(max-width: 768px)");
  let isMobile = mobileQuery.matches;
  const handleMobileChange = (event: MediaQueryListEvent) => {
    isMobile = event.matches;
  };
  mobileQuery.addEventListener("change", handleMobileChange);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  const gl = renderer.getContext();

  if (!gl) {
    throw new Error("Failed to acquire WebGL context");
  }

  const originalGetShaderInfoLog = gl.getShaderInfoLog.bind(gl) as (
    shader: WebGLShader | null,
  ) => string | null;
  const originalGetProgramInfoLog = gl.getProgramInfoLog.bind(gl) as (
    program: WebGLProgram | null,
  ) => string | null;

  gl.getShaderInfoLog = ((shader) =>
    originalGetShaderInfoLog(shader) ?? "") as typeof gl.getShaderInfoLog;
  gl.getProgramInfoLog = ((program) =>
    originalGetProgramInfoLog(program) ?? "") as typeof gl.getProgramInfoLog;

  renderer.setClearColor(new THREE.Color("#000000"), 0);
  // === pastel/filmic renderer ===
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // menos brilho no tema claro, levemente mais no escuro
  renderer.toneMappingExposure = getToneMappingExposure(theme);
  // sombras desligadas para evitar contorno duro
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = createCamera();
  scene.add(camera);

  const effectivePalette = ensurePalette(palette, theme);
  const baseVariantTemplate = variantMapping[initialVariant];
  const initialVariantState = createResponsiveVariantState(
    baseVariantTemplate,
    globalWindow.innerWidth,
    globalWindow.innerHeight,
  );
  const shapes = await addDuartoisSignatureShapes(
    scene,
    initialVariantState,
    theme,
  );
  shapes.setBrightness(DEFAULT_BRIGHTNESS);
  const shapesGroup = shapes.group;
  const baseGroupZ = shapesGroup.position.z;
  const shapeIds = Object.keys(shapes.meshes) as ShapeId[];
  const initialShapeOpacity = shapeIds.reduce(
    (acc, id) => {
      acc[id] = 1;
      return acc;
    },
    {} as Record<ShapeId, number>,
  );
  const initialVariantClone = createVariantState(initialVariantState);
  let targetVariantState = initialVariantClone;
  const initialState: ThreeAppState = {
    variantName: initialVariant,
    variant: createVariantState(initialVariantClone),
    variantTransitionMs: null,
    hoverVariants: null,
    palette: effectivePalette,
    theme,
    parallax,
    hovered: false,
    cursorBoost: 0,
    pointer: { x: 0, y: 0 },
    pointerDriver: "device",
    manualPointer: { x: 0, y: 0 },
    opacity: 1,
    shapeOpacity: { ...initialShapeOpacity },
    brightness: DEFAULT_BRIGHTNESS,
    ready: false,
  };

  updateAllMeshOpacities(
    shapeIds,
    shapes.meshes,
    initialState.opacity,
    initialState.shapeOpacity,
  );

  const eventTarget = new EventTarget();

  let state = initialState;
  let shapeOpacityState = { ...initialShapeOpacity };
  const pointer = new THREE.Vector2();
  const devicePointerTarget = new THREE.Vector2();
  const manualPointerTarget = new THREE.Vector2();

  devicePointerTarget.set(initialState.pointer.x, initialState.pointer.y);
  manualPointerTarget.set(
    initialState.manualPointer.x,
    initialState.manualPointer.y,
  );

  const clock = new THREE.Clock();
  let isVisible = !globalWindow.document.hidden;
  let readyDispatched = false;
  let animationId: number | null = null;
  let disposed = false;
  const pointerListenerOptions = { passive: true } as const;

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (height === 0) {
      return;
    }

    if (canvas.width !== width || canvas.height !== height) {
      renderer.setPixelRatio(Math.min(globalWindow.devicePixelRatio, 1.5));
      renderer.setSize(width, height, false);
    }

    // ortho frustum: top/bottom fixos e left/right por aspecto
    const aspect = width / height;
    const ortho = camera as unknown as THREE.OrthographicCamera;
    ortho.left = -aspect;
    ortho.right = aspect;
    ortho.top = 1;
    ortho.bottom = -1;
    ortho.updateProjectionMatrix();

    setState((previous) => ({
      variant: createResponsiveVariantState(
        variantMapping[previous.variantName],
        width,
        height,
      ),
    }));
  };


  const pointerMove = (event: PointerEvent) => {
    const width = globalWindow.innerWidth;
    const height = globalWindow.innerHeight;
    const x = (event.clientX / width) * 2 - 1;
    const y = -((event.clientY / height) * 2 - 1);
    devicePointerTarget.set(x, y);
    if (state.pointerDriver === "device") {
      state = {
        ...state,
        pointer: { x, y },
      };
    }
  };

  const pointerEnter = () => {
    setState({ hovered: true });
  };

  const pointerLeave = () => {
    setState({ hovered: false });
  };

  const tick = () => {
    if (disposed) {
      return;
    }

    if (!isVisible) {
      animationId = null;
      return;
    }

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    const variantLerp = (() => {
      if (state.variantTransitionMs && state.variantTransitionMs > 0) {
        const duration = Math.max(state.variantTransitionMs, 1) / 1000;
        const targetProgress = 0.98;
        const lambda = -Math.log(1 - targetProgress) / duration;
        return clamp(1 - Math.exp(-lambda * delta), 0, 1);
      }

      return clamp(delta * (state.hovered ? 7 : 5), 0, 1);
    })();
    if (variantLerp > 0) {
      shapeIds.forEach((id) => {
        const mesh = shapes.meshes[id];
        const target = targetVariantState[id];
        if (!target) {
          return;
        }

        const [tx, ty, tz] = target.position;
        mesh.position.x += (tx - mesh.position.x) * variantLerp;
        mesh.position.y += (ty - mesh.position.y) * variantLerp;
        mesh.position.z += (tz - mesh.position.z) * variantLerp;

        const [rx, ry, rz] = target.rotation;
        mesh.rotation.x += (rx - mesh.rotation.x) * variantLerp;
        mesh.rotation.y += (ry - mesh.rotation.y) * variantLerp;
        mesh.rotation.z += (rz - mesh.rotation.z) * variantLerp;

        const scaleTarget = target.scale;
        if (Array.isArray(scaleTarget)) {
          const [sx, sy, sz] = scaleTarget;
          mesh.scale.x += (sx - mesh.scale.x) * variantLerp;
          mesh.scale.y += (sy - mesh.scale.y) * variantLerp;
          mesh.scale.z += (sz - mesh.scale.z) * variantLerp;
        } else {
          const uniform = scaleTarget ?? 1;
          mesh.scale.x += (uniform - mesh.scale.x) * variantLerp;
          mesh.scale.y += (uniform - mesh.scale.y) * variantLerp;
          mesh.scale.z += (uniform - mesh.scale.z) * variantLerp;
        }
      });
    }

    const targetPointer = getPointerTargetVector(
      state.pointerDriver,
      manualPointerTarget,
      devicePointerTarget,
    );

    pointer.lerp(targetPointer, clamp(delta * 7, 0, 1));

    const mobile = isMobile;
    const baseTilt = mobile ? 0.18 : 0.32;
    const parallaxStrength = state.parallax ? baseTilt : 0;
    const breathe = (mobile ? 0.006 : 0.01) * Math.sin(elapsed * 0.85);
    const hoverBoost = state.hovered ? 0.045 : 0;

    const targetPosX = pointer.x * parallaxStrength;
    const targetPosY = pointer.y * parallaxStrength * 0.75;

    shapesGroup.position.x += (targetPosX - shapesGroup.position.x) * clamp(delta * 6, 0, 1);
    shapesGroup.position.y += (targetPosY - shapesGroup.position.y) * clamp(delta * 6, 0, 1);

     const scaleTarget = 1 + breathe + hoverBoost + state.cursorBoost;
    const lerpScale = clamp(delta * 4, 0, 1);
    const currentScale = shapesGroup.scale.x;
    const nextScale = currentScale + (scaleTarget - currentScale) * lerpScale;
    shapesGroup.scale.setScalar(nextScale);
    const maxX = (mobile ? 0.22 : 0.32) * (globalWindow.innerWidth / 2) * 0.01;
    const maxY = (mobile ? 0.18 : 0.26) * (globalWindow.innerHeight / 2) * 0.01;
    shapesGroup.position.x = clamp(shapesGroup.position.x, -maxX, maxX);
    shapesGroup.position.y = clamp(shapesGroup.position.y, -maxY, maxY);

    renderer.render(scene, camera);

    if (!readyDispatched && elapsed > 0.35) {
      readyDispatched = true;
      state = { ...state, ready: true };
      dispatchReady(eventTarget);
      dispatchStateChange(eventTarget, state);
    }

    if (!disposed) {
      animationId = globalWindow.requestAnimationFrame(tick);
    }
  };

  const handleVisibilityChange = () => {
    isVisible = !globalWindow.document.hidden;

    if (!isVisible) {
      if (animationId !== null) {
        globalWindow.cancelAnimationFrame(animationId);
        animationId = null;
      }
      clock.stop();
      return;
    }

    clock.start();
    if (!disposed && animationId === null) {
      animationId = globalWindow.requestAnimationFrame(tick);
    }
  };

  const setState: ThreeAppHandle["setState"] = (updater: StateUpdater) => {
    const snapshot = createStateSnapshot(state);
    const partial =
      typeof updater === "function" ? updater(snapshot) : { ...updater };

    let changed = false;
    let nextState = state;
    let pendingOpacity = state.opacity;
    let opacityChanged = false;
    let pendingShapeOpacity = shapeOpacityState;
    let shapeOpacityChanged = false;

    const commit = (updates: Partial<ThreeAppState>) => {
      nextState = { ...nextState, ...updates };
      changed = true;
    };

    if (partial.variantName && partial.variantName !== state.variantName) {
      const mapped = variantMapping[partial.variantName];
      const responsiveVariant = createResponsiveVariantState(
        mapped,
        globalWindow.innerWidth,
        globalWindow.innerHeight,
      );
      targetVariantState = createVariantState(responsiveVariant);
      commit({
        variantName: partial.variantName,
        variant: createVariantState(responsiveVariant),
      });
    }

    if (partial.palette) {
      commit({ palette: partial.palette });
    }

    if (partial.theme && partial.theme !== state.theme) {
      const nextPalette = partial.palette ?? getDefaultPalette(partial.theme);
      shapes.applyTheme(partial.theme);

      renderer.toneMappingExposure = getToneMappingExposure(partial.theme);
      updateAllMeshOpacities(
        shapeIds,
        shapes.meshes,
        pendingOpacity,
        pendingShapeOpacity,
      );
      commit({ theme: partial.theme, palette: nextPalette });
    }

    if (typeof partial.brightness === "number") {
      const nextBrightness = clamp(partial.brightness, 0.5, 2);
      if (nextBrightness !== state.brightness) {
        shapes.setBrightness(nextBrightness);
        commit({ brightness: nextBrightness });
      }
    }

    if (typeof partial.parallax === "boolean" && partial.parallax !== state.parallax) {
      commit({ parallax: partial.parallax });
    }

    if (typeof partial.hovered === "boolean" && partial.hovered !== state.hovered) {
      commit({ hovered: partial.hovered });
    }

    if (typeof partial.cursorBoost === "number") {
      const boost = clamp(partial.cursorBoost, -0.3, 0.45);
      if (boost !== state.cursorBoost) {
        commit({ cursorBoost: boost });
      }
    }

    if (partial.manualPointer) {
      manualPointerTarget.set(partial.manualPointer.x, partial.manualPointer.y);
      commit({ manualPointer: { ...partial.manualPointer } });
      const effectiveDriver = partial.pointerDriver ?? nextState.pointerDriver;
      if (effectiveDriver === "manual") {
        commit({ pointer: { ...partial.manualPointer } });
      }
    }

    if (partial.pointerDriver && partial.pointerDriver !== state.pointerDriver) {
      const source = getPointerTargetVector(
        partial.pointerDriver,
        manualPointerTarget,
        devicePointerTarget,
      );
      commit({
        pointerDriver: partial.pointerDriver,
        pointer: { x: source.x, y: source.y },
      });
    }

    if (typeof partial.opacity === "number") {
      const nextOpacity = clamp(partial.opacity, 0, 1);
      if (nextOpacity !== pendingOpacity) {
        pendingOpacity = nextOpacity;
        opacityChanged = true;
        commit({ opacity: nextOpacity });
      }
    }

    if (partial.shapeOpacity) {
      const updatedOpacity = { ...pendingShapeOpacity };
      let localChange = false;

      (Object.entries(partial.shapeOpacity) as [ShapeId, number][]).forEach(
        ([key, value]) => {
          if (!(key in updatedOpacity)) {
            return;
          }

          const clampedValue = clamp(value, 0, 1);
          if (updatedOpacity[key] !== clampedValue) {
            updatedOpacity[key] = clampedValue;
            localChange = true;
          }
        },
      );

      if (localChange) {
        pendingShapeOpacity = updatedOpacity;
        shapeOpacityChanged = true;
        commit({ shapeOpacity: { ...pendingShapeOpacity } });
      }
    }

    if (opacityChanged || shapeOpacityChanged) {
      updateAllMeshOpacities(
        shapeIds,
        shapes.meshes,
        pendingOpacity,
        pendingShapeOpacity,
      );
    }

    if ("variantTransitionMs" in partial) {
      const nextTransition =
        typeof partial.variantTransitionMs === "number"
          ? Math.max(partial.variantTransitionMs, 0)
          : null;
      if (nextTransition !== state.variantTransitionMs) {
        commit({ variantTransitionMs: nextTransition });
      }
    }

    if (partial.variant) {
      targetVariantState = createVariantState(partial.variant);
      commit({ variant: createVariantState(partial.variant) });
    }

    state = nextState;
    shapeOpacityState = pendingShapeOpacity;

    if (changed) {
      dispatchStateChange(eventTarget, state);
    }
  };

  const dispose = () => {
    if (disposed) {
      return;
    }

    disposed = true;

    if (animationId !== null) {
      globalWindow.cancelAnimationFrame(animationId);
      animationId = null;
    }
    mobileQuery.removeEventListener("change", handleMobileChange);
    globalWindow.removeEventListener("resize", resize);
    globalWindow.removeEventListener("pointermove", pointerMove);
    globalWindow.removeEventListener("pointerenter", pointerEnter);
    globalWindow.removeEventListener("pointerleave", pointerLeave);
    globalWindow.removeEventListener("visibilitychange", handleVisibilityChange);
    shapes.dispose();
    // Keep the renderer cleanup quiet for devtools/extensions by avoiding a
    // forced context loss. `renderer.dispose()` is enough to release GPU
    // resources without triggering "Context Lost" warnings.
    renderer.dispose();
    detachFromWindow(handle);
  };

  const handle: ThreeAppHandle = {
    setState,
    dispose,
    bundle: {
      getState: () => createStateSnapshot(state),
      events: eventTarget,
      scene,
      camera,
      renderer,
      variantMapping,
    },
  };

  attachToWindow(handle);

  resize();
  globalWindow.addEventListener("resize", resize);
  globalWindow.addEventListener("pointermove", pointerMove, pointerListenerOptions);
  globalWindow.addEventListener("pointerenter", pointerEnter, pointerListenerOptions);
  globalWindow.addEventListener("pointerleave", pointerLeave, pointerListenerOptions);
  globalWindow.addEventListener("visibilitychange", handleVisibilityChange);

  dispatchStateChange(eventTarget, state);

  if (isVisible) {
    animationId = globalWindow.requestAnimationFrame(tick);
  }

  return handle;
};

export default initScene;
