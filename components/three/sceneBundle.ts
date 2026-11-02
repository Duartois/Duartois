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
  type ThreeAppHandle,
  type ThreeAppState,
  type ThemeName,
  type VariantName,
  type VariantState,
  createVariantState,
  createResponsiveVariantState,
  getDefaultPalette,
  getVariantShapeBlur,
  getVariantShapeOpacity,
  variantMapping,
} from "./types";
import { createCamera, ensurePalette } from "./factories";
import {
  getWindow,
  clamp,
  isSafari,
  isIOS,
  getRendererPixelRatio,
} from "@/app/helpers/runtime/index";
import {
  APP_PERFORMANCE_PRESSURE_EVENT,
  dispatchAppEvent,
} from "@/app/helpers/appEvents";
import { updateAllMeshOpacities } from "./materialOpacity";
import { dampStep, easeToward, omegaForSettleMs } from "./motion";
import { getMotionPreset } from "@/app/helpers/motionPresets";
import { getPointerTargetVector } from "./pointerDriver";
import {
  applyGradientToGeometry,
  createShapeGeometry,
  type GeometryDetail,
  type GradientAxis,
} from "./geometry";

// ─── Shapes ───────────────────────────────────────────────────────────────────

export type ShapesHandle = {
  group: THREE.Group;
  meshes: Record<ShapeId, THREE.Mesh>;
  applyVariant: (variant: VariantState) => void;
  applyTheme: (theme: ThemeName) => void;
  setBrightness: (value: number) => void;
  setShapeBlur: (shapeBlur: Record<ShapeId, number>) => void;
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

const createGlossyMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    // Always on the blended path: fading a shape in/out must never switch the
    // compiled shader (a first-time compile of that variant costs hundreds of
    // ms on integrated GPUs, right in the middle of a navigation). With
    // alpha = 1 it renders exactly like an opaque material.
    transparent: true,
    vertexColors: true,
    roughness: 0.012,
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

export async function addDuartoisSignatureShapes(
  scene: THREE.Scene,
  initialVariant: VariantState,
  initialTheme: ThemeName,
  detail: GeometryDetail = "high",
): Promise<ShapesHandle> {
  const group = new THREE.Group();
  scene.add(group);
  group.scale.setScalar(1.2);

  const meshes = SHAPE_ORDER.reduce<Record<ShapeId, THREE.Mesh>>(
    (acc, id) => {
      const geometry = applyGradientToGeometry(
        createShapeGeometry(id, detail),
        GRADIENT_STOPS[id],
        GRADIENT_AXES[id],
      );
      const mesh = new THREE.Mesh(geometry, createGlossyMaterial());
      mesh.name = id;
      mesh.frustumCulled = false;
      acc[id] = mesh;
      return acc;
    },
    {} as Record<ShapeId, THREE.Mesh>,
  );

  const materials = SHAPE_ORDER.reduce<
    Record<ShapeId, THREE.MeshPhysicalMaterial>
  >(
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
      material.transparent = true;
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

  const setShapeBlur = (shapeBlur: Record<ShapeId, number>) => {
    SHAPE_ORDER.forEach((id) => {
      const material = materials[id];
      const blur = clamp(shapeBlur[id] ?? 0, 0, 1);
      material.roughness = 0.22 + blur * 0.62;
      material.clearcoat = 0.14 - blur * 0.12;
      material.envMapIntensity = 0.08 - blur * 0.06;
    });
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
    setShapeBlur,
    dispose,
  };
}

// ─── Scene init ───────────────────────────────────────────────────────────────

export type InitSceneOptions = {
  canvas: HTMLCanvasElement;
  initialVariant?: VariantName;
  theme: ThemeName;
  palette?: GradientPalette;
  parallax?: boolean;
  /** Resolved animation quality tier; drives tessellation and resolution. */
  quality?: "high" | "low";
  /** Overrides the tessellation tier derived from `quality`. */
  detail?: GeometryDetail;
};

/** Pages that show the canvas through `backdrop-filter: blur(60px)` (see globals.css). */
const BLURRED_PAGE_SELECTOR = ".about-page, .contact-page, .projects, .project";

/** Distance (world units / radians) below which the scene counts as settled. */
const SETTLE_EPSILON = 5e-4;
const BREATHING_TOLERANCE = 0.006;

/** The 60px blur hides any detail beyond 1 canvas pixel per CSS pixel. */
const BLURRED_MAX_PIXEL_RATIO = 1;
const MIN_PIXEL_RATIO = 0.7;
const BLUR_RATIO_DELAY_MS = 450;
const BLUR_CHECK_INTERVAL_MS = 250;
const BLUR_RETRY_MS = 200;

/** Adaptive resolution steps applied if frames keep running slow. */
const PERF_SCALES = [1, 0.85, 0.7] as const;
const PERF_SAMPLE_FRAMES = 60;
/** Average frame time (ms) above which we're missing 60 fps by a wide margin (~48 fps). */
const SLOW_FRAME_MS = 21;

const getToneMappingExposure = (theme: ThemeName) =>
  theme === "light" ? 1.1 : 1.5;

/**
 * Maximum delta (seconds) consumed by the render loop per frame.
 *
 * Safari on iOS suspends JS aggressively when a tab is backgrounded, and a
 * route commit can freeze the main thread for a few hundred ms. The spring
 * step is closed-form, so a long frame just takes a proportionally bigger step;
 * the clamp only guards against absurd deltas (e.g. after a suspension).
 */
const MAX_DELTA_S = 0.25;

/** Spring stiffness (1/s) when no explicit transition time is set: ~98% in 0.78s. */
const OMEGA_DEFAULT = 7.5;
/** Same, while hovering the hero: ~98% in 0.56s. */
const OMEGA_HOVER = 10.4;
/** How much residual velocity counts towards "not settled yet". */
const VELOCITY_WEIGHT = 0.05;
/** Opacity/blur values closer than this to their target snap onto it. */
const VISUAL_EPSILON = 2e-3;

const initScene = async ({
  canvas,
  initialVariant = "home",
  theme,
  palette,
  parallax = true,
  quality = "high",
  detail,
}: InitSceneOptions): Promise<ThreeAppHandle> => {
  const globalWindow = getWindow();

  if (!globalWindow) {
    throw new Error("initScene requires a browser environment");
  }

  const mobileQuery = globalWindow.matchMedia("(max-width: 768px)");
  let isMobile = mobileQuery.matches;
  const preset = getMotionPreset(quality);
  const geometryDetail: GeometryDetail =
    detail ??
    (quality === "low" ? "low" : isMobile ? "medium" : preset.geometry);
  const handleMobileChange = (event: MediaQueryListEvent) => {
    isMobile = event.matches;
  };
  mobileQuery.addEventListener("change", handleMobileChange);

  // ── Renderer: Safari/iOS-aware options ────────────────────────────────────
  //
  // antialias: MSAA on tile-based GPUs (all iPhones/iPads) is resolved in the
  // resolve pass — as expensive as rendering 4× the pixels. Disable on mobile
  // and iOS for a significant GPU frame-time reduction with imperceptible loss.
  //
  // powerPreference: hints the compositor to use the discrete GPU on dual-GPU
  // Macs and avoids the power-saving throttle on iOS 16+ when plugged in.
  //
  // premultipliedAlpha: false avoids compositing artefacts on transparent
  // canvases that Safari has historically exhibited with premultiplied alpha.
  const useMobileAntialias = !isMobile && !isIOS();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: useMobileAntialias,
    alpha: true,
    powerPreference: "high-performance",
    premultipliedAlpha: false,
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
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMappingExposure = getToneMappingExposure(theme);
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = createCamera(
    globalWindow.innerWidth,
    globalWindow.innerHeight,
  );
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
    geometryDetail,
  );
  shapes.setBrightness(DEFAULT_BRIGHTNESS);
  const shapesGroup = shapes.group;
  const shapeIds = Object.keys(shapes.meshes) as ShapeId[];
  const initialShapeOpacity = getVariantShapeOpacity(initialVariantState);
  const initialShapeBlur = getVariantShapeBlur(initialVariantState);
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
    shapeBlur: { ...initialShapeBlur },
    brightness: DEFAULT_BRIGHTNESS,
    ready: false,
  };

  updateAllMeshOpacities(
    shapeIds,
    shapes.meshes,
    initialState.opacity,
    initialState.shapeOpacity,
  );
  shapes.setShapeBlur(initialState.shapeBlur);

  const eventTarget = new EventTarget();

  let state = initialState;
  let shapeOpacityState = { ...initialShapeOpacity };
  let shapeBlurState = { ...initialShapeBlur };
  // What the materials should end up showing (kept apart from the state above:
  // an explicit shapeOpacity/blur wins for the materials while the variant keeps
  // its own values for later restores).
  let visualOpacity = initialState.opacity;
  let visualShapeOpacity = { ...initialShapeOpacity };
  let visualShapeBlur = { ...initialShapeBlur };
  // What is on screen right now: eased toward the targets above every frame, so
  // opacity and blur glide between pages instead of popping.
  let appliedOpacity = initialState.opacity;
  const appliedShapeOpacity = { ...initialShapeOpacity };
  const appliedShapeBlur = { ...initialShapeBlur };
  // 3 position + 3 rotation + 3 scale spring velocities per shape.
  const velocities = {} as Record<ShapeId, Float64Array>;
  shapeIds.forEach((id) => {
    velocities[id] = new Float64Array(9);
  });
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
  let timerId: number | null = null;
  let disposed = false;
  const pointerListenerOptions = { passive: true } as const;

  // ── Frame pacing ───────────────────────────────────────────────────────────
  // The scene used to render every vsync forever, even when nothing moved. That
  // keeps the GPU (and, on pages with a backdrop blur, the compositor) busy on
  // phones and fanless laptops. Now:
  //  - while something is moving we render at up to ~60 fps;
  //  - when everything has settled, pages with the breathing idle motion tick
  //    at a low heartbeat (the motion is ~1% scale, imperceptible below that);
  //  - blurred pages (60px CSS blur hides the breathing) stop rendering
  //    entirely until something changes again.
  let moving = true;
  let asleep = false;
  let lastRenderAt = 0;

  // ── Resolution ─────────────────────────────────────────────────────────────
  let currentPixelRatio = 0;
  let blurredRatio = false;
  let blurTimer: number | null = null;
  let perfStep = 0;
  let lastBlurCheckAt = 0;
  let lastActiveFrameAt = 0;
  let activeFrameTotal = 0;
  let activeFrameSamples = 0;

  const isMenuOpen = () =>
    globalWindow.document.body?.dataset.menuOpen === "true";

  // The blur is only real where the browser applies the unprefixed
  // `backdrop-filter` (e.g. not Safari <= 17). Without it the canvas is shown
  // sharp, so it must keep its full resolution and idle motion there.
  const supportsBackdropBlur =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("backdrop-filter", "blur(1px)");

  // Mirrors the CSS rule that applies `backdrop-filter: blur(60px)` — on those
  // pages the canvas is shown through a heavy blur, so it can be rendered at a
  // lower resolution (and without the idle breathing) with no visible change.
  const isBlurredPage = () =>
    supportsBackdropBlur &&
    !isMenuOpen() &&
    globalWindow.document.querySelector(BLURRED_PAGE_SELECTOR) !== null;

  const computePixelRatio = () => {
    let ratio = Math.min(getRendererPixelRatio(), preset.maxPixelRatio);
    if (blurredRatio) {
      ratio = Math.min(ratio, BLURRED_MAX_PIXEL_RATIO);
    }
    return Math.max(MIN_PIXEL_RATIO, ratio * PERF_SCALES[perfStep]);
  };

  const renderNow = () => {
    renderer.render(scene, camera);
    lastRenderAt = globalWindow.performance.now();
  };

  /**
   * Applies the effective pixel ratio and resizes the drawing buffer. Returns
   * true when the buffer changed (which clears it, so we re-render right away
   * to avoid presenting an empty frame).
   */
  const applyPixelRatio = (force = false) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (height === 0) {
      return false;
    }

    const ratio = computePixelRatio();

    if (!force && ratio === currentPixelRatio) {
      return false;
    }

    currentPixelRatio = ratio;
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    return true;
  };

  const requestFrame = (delayMs = 0) => {
    if (disposed || !isVisible || animationId !== null || timerId !== null) {
      return;
    }

    if (delayMs > 4) {
      timerId = globalWindow.setTimeout(() => {
        timerId = null;
        if (!disposed && isVisible && animationId === null) {
          animationId = globalWindow.requestAnimationFrame(tick);
        }
      }, delayMs);
      return;
    }

    animationId = globalWindow.requestAnimationFrame(tick);
  };

  const cancelFrame = () => {
    if (animationId !== null) {
      globalWindow.cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (timerId !== null) {
      globalWindow.clearTimeout(timerId);
      timerId = null;
    }
  };

  /** Marks the scene dirty and makes sure the render loop is running. */
  const wake = () => {
    moving = true;

    if (asleep) {
      asleep = false;
      // Discard the time spent asleep so the first frame doesn't take a huge
      // lerp step towards the target.
      clock.getDelta();
    }

    requestFrame();
  };

  // Dropping to the blurred resolution waits for the CSS blur to fade in and for
  // the scene (and the page swap) to calm down, so a buffer reallocation never
  // lands in the middle of a navigation.
  const armBlurTimer = (delay: number) => {
    blurTimer = globalWindow.setTimeout(() => {
      blurTimer = null;
      if (disposed || !isBlurredPage()) {
        return;
      }
      if (moving || globalWindow.document.body?.dataset.navigating === "true") {
        armBlurTimer(BLUR_RETRY_MS);
        return;
      }
      blurredRatio = true;
      if (applyPixelRatio()) {
        renderNow();
      }
      wake();
    }, delay);
  };

  const syncBlurredRatio = () => {
    if (!isBlurredPage()) {
      if (blurTimer !== null) {
        globalWindow.clearTimeout(blurTimer);
        blurTimer = null;
      }
      if (blurredRatio) {
        blurredRatio = false;
        if (applyPixelRatio()) {
          renderNow();
        }
        wake();
      }
      return;
    }

    if (!blurredRatio && blurTimer === null) {
      armBlurTimer(BLUR_RATIO_DELAY_MS);
    }
  };

  /**
   * Safety net for weak GPUs: if frames keep missing the 60 fps budget by a
   * wide margin while the scene is animating, step the render resolution down. It
   * only ever goes down, so a device that can't keep up settles on a lower
   * (but smooth) resolution instead of stuttering.
   */
  const trackFramePerformance = (now: number, wasMoving: boolean) => {
    if (
      !wasMoving ||
      lastActiveFrameAt === 0 ||
      now - lastActiveFrameAt > 100 ||
      globalWindow.document.body?.dataset.navigating === "true"
    ) {
      lastActiveFrameAt = wasMoving ? now : 0;
      return;
    }

    activeFrameTotal += now - lastActiveFrameAt;
    activeFrameSamples += 1;
    lastActiveFrameAt = now;

    if (activeFrameSamples < PERF_SAMPLE_FRAMES) {
      return;
    }

    const average = activeFrameTotal / activeFrameSamples;
    activeFrameTotal = 0;
    activeFrameSamples = 0;

    if (average > SLOW_FRAME_MS) {
      // Tell the rest of the app too, so animations switch to the light preset.
      dispatchAppEvent(APP_PERFORMANCE_PRESSURE_EVENT);

      if (perfStep < PERF_SCALES.length - 1) {
        perfStep += 1;
        if (applyPixelRatio()) {
          renderNow();
        }
      }
    }
  };

  /** Writes the currently applied opacity/blur values into the materials. */
  const pushAppliedVisuals = () => {
    updateAllMeshOpacities(
      shapeIds,
      shapes.meshes,
      appliedOpacity,
      appliedShapeOpacity,
    );
    shapes.setShapeBlur(appliedShapeBlur);
  };

  const resetVelocities = () => {
    shapeIds.forEach((id) => velocities[id].fill(0));
  };

  /** Jumps the on-screen opacity/blur straight to their targets. */
  const snapVisuals = () => {
    appliedOpacity = visualOpacity;
    shapeIds.forEach((id) => {
      appliedShapeOpacity[id] = visualShapeOpacity[id];
      appliedShapeBlur[id] = visualShapeBlur[id];
    });
    pushAppliedVisuals();
  };

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (height === 0) {
      return;
    }

    // Pixel ratio is capped per device class and quality tier (see
    // computePixelRatio). Applied on every resize so DPR changes (moving
    // between screens) are handled correctly.
    applyPixelRatio(true);

    const aspect = width / height;
    const ortho = camera as unknown as THREE.OrthographicCamera;
    ortho.left = -aspect;
    ortho.right = aspect;
    ortho.top = 1;
    ortho.bottom = -1;
    ortho.updateProjectionMatrix();

    // Responsive layouts are re-applied by each page (useThreeSceneSetup); the
    // scene must not retarget a layout of its own here, or a plain resize (e.g.
    // the mobile URL bar collapsing) would pull the shapes towards the Home.
    wake();
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

      if (state.parallax) {
        wake();
      }
    }
  };

  const pointerEnter = () => {
    setState({ hovered: true });
  };

  const pointerLeave = () => {
    setState({ hovered: false });
  };

  const tick = (now: number) => {
    animationId = null;

    if (disposed || !isVisible) {
      return;
    }

    // Throttle: full rate (capped, so 120 Hz screens don't double the work)
    // while moving, a slow heartbeat otherwise.
    const minInterval = moving ? preset.activeFrameMs : preset.idleFrameMs;
    if (now - lastRenderAt < minInterval) {
      requestFrame(minInterval - (now - lastRenderAt));
      return;
    }

    const wasMoving = moving;
    trackFramePerformance(now, wasMoving);

    // ── Safari/iOS tab-switch guard ──────────────────────────────────────────
    // When the tab is backgrounded and restored, getDelta() can return several
    // seconds. Clamping to MAX_DELTA_S limits any positional jump to at most
    // 1 missed frame at 60 fps.
    const rawDelta = clock.getDelta();
    const delta = Math.min(rawDelta, MAX_DELTA_S);
    const elapsed = clock.getElapsedTime();

    // Spring stiffness: a navigation sets the time it should take; otherwise a
    // gentle default (a touch snappier while hovering the hero).
    const omega =
      state.variantTransitionMs && state.variantTransitionMs > 0
        ? omegaForSettleMs(state.variantTransitionMs)
        : state.hovered
          ? OMEGA_HOVER
          : OMEGA_DEFAULT;

    // Largest remaining distance to any target; used to decide when the scene
    // has settled and rendering can slow down or stop.
    let remaining = 0;
    const track = (difference: number) => {
      const distance = Math.abs(difference);
      if (distance > remaining) {
        remaining = distance;
      }
    };

    shapeIds.forEach((id) => {
      const mesh = shapes.meshes[id];
      const target = targetVariantState[id];
      if (!target) {
        return;
      }

      const velocity = velocities[id];
      const spring = (current: number, goal: number, slot: number) => {
        const next = dampStep(current, goal, velocity, slot, omega, delta);
        track(
          Math.abs(next - goal) + Math.abs(velocity[slot]) * VELOCITY_WEIGHT,
        );
        return next;
      };

      const [tx, ty, tz] = target.position;
      mesh.position.x = spring(mesh.position.x, tx, 0);
      mesh.position.y = spring(mesh.position.y, ty, 1);
      mesh.position.z = spring(mesh.position.z, tz, 2);

      const [rx, ry, rz] = target.rotation;
      mesh.rotation.x = spring(mesh.rotation.x, rx, 3);
      mesh.rotation.y = spring(mesh.rotation.y, ry, 4);
      mesh.rotation.z = spring(mesh.rotation.z, rz, 5);

      const scaleTarget = target.scale;
      const [sx, sy, sz] = Array.isArray(scaleTarget)
        ? scaleTarget
        : [scaleTarget ?? 1, scaleTarget ?? 1, scaleTarget ?? 1];
      mesh.scale.x = spring(mesh.scale.x, sx, 6);
      mesh.scale.y = spring(mesh.scale.y, sy, 7);
      mesh.scale.z = spring(mesh.scale.z, sz, 8);
    });

    // Opacity and blur glide towards the page's values too.
    const visualRate = omega * 1.5;
    let visualChanged = false;
    const ease = (current: number, goal: number) => {
      if (current === goal) {
        return current;
      }
      visualChanged = true;
      const next = easeToward(current, goal, visualRate, delta);
      const settled = Math.abs(next - goal) < VISUAL_EPSILON;
      track(settled ? 0 : Math.abs(next - goal));
      return settled ? goal : next;
    };

    appliedOpacity = ease(appliedOpacity, visualOpacity);
    shapeIds.forEach((id) => {
      appliedShapeOpacity[id] = ease(
        appliedShapeOpacity[id],
        visualShapeOpacity[id],
      );
      appliedShapeBlur[id] = ease(appliedShapeBlur[id], visualShapeBlur[id]);
    });

    if (visualChanged) {
      pushAppliedVisuals();
    }

    const targetPointer = getPointerTargetVector(
      state.pointerDriver,
      manualPointerTarget,
      devicePointerTarget,
    );

    track(targetPointer.x - pointer.x);
    track(targetPointer.y - pointer.y);
    pointer.lerp(targetPointer, clamp(delta * 7, 0, 1));

    const mobile = isMobile;
    const baseTilt = mobile ? 0.18 : 0.32;
    const parallaxStrength = state.parallax ? baseTilt : 0;
    // The idle "breathing" is hidden by the CSS blur on the inner pages.
    const breathing = !blurredRatio;
    const breathe = breathing
      ? (mobile ? 0.006 : 0.01) * Math.sin(elapsed * 0.85)
      : 0;
    const hoverBoost = state.hovered ? 0.045 : 0;

    const targetPosX = pointer.x * parallaxStrength;
    const targetPosY = pointer.y * parallaxStrength * 0.75;

    const maxX = (mobile ? 0.22 : 0.32) * (globalWindow.innerWidth / 2) * 0.01;
    const maxY = (mobile ? 0.18 : 0.26) * (globalWindow.innerHeight / 2) * 0.01;

    track(clamp(targetPosX, -maxX, maxX) - shapesGroup.position.x);
    track(clamp(targetPosY, -maxY, maxY) - shapesGroup.position.y);
    shapesGroup.position.x +=
      (targetPosX - shapesGroup.position.x) * clamp(delta * 6, 0, 1);
    shapesGroup.position.y +=
      (targetPosY - shapesGroup.position.y) * clamp(delta * 6, 0, 1);

    const scaleTarget = 1 + breathe + hoverBoost + state.cursorBoost;
    const lerpScale = clamp(delta * 4, 0, 1);
    const currentScale = shapesGroup.scale.x;
    const scaleDistance = Math.abs(scaleTarget - currentScale);
    const nextScale = currentScale + (scaleTarget - currentScale) * lerpScale;
    shapesGroup.scale.setScalar(nextScale);
    shapesGroup.position.x = clamp(shapesGroup.position.x, -maxX, maxX);
    shapesGroup.position.y = clamp(shapesGroup.position.y, -maxY, maxY);

    renderNow();

    if (!readyDispatched && elapsed > 0.35) {
      readyDispatched = true;
      state = { ...state, ready: true };
      dispatchReady(eventTarget);
      dispatchStateChange(eventTarget, state);
    }

    // While breathing, the scale always trails its (moving) target slightly;
    // tolerate that so the scene can still be considered settled.
    const scaleTolerance = breathing ? BREATHING_TOLERANCE : SETTLE_EPSILON;
    moving =
      remaining > SETTLE_EPSILON ||
      scaleDistance > scaleTolerance ||
      !readyDispatched;

    if (now - lastBlurCheckAt > BLUR_CHECK_INTERVAL_MS) {
      lastBlurCheckAt = now;
      syncBlurredRatio();
    }

    if (disposed) {
      return;
    }

    if (moving) {
      requestFrame();
    } else if (breathing) {
      requestFrame(preset.idleFrameMs);
    } else {
      asleep = true;
    }
  };

  const handleVisibilityChange = () => {
    isVisible = !globalWindow.document.hidden;

    if (!isVisible) {
      cancelFrame();
      clock.stop();
      asleep = true;
      return;
    }

    // Reset the clock so getDelta() starts fresh after suspension.
    // Belt-and-suspenders with the MAX_DELTA_S clamp above.
    clock.start();
    asleep = false;
    wake();
  };

  const handleMenuChange = () => {
    syncBlurredRatio();
    wake();
  };

  const menuObserver =
    typeof MutationObserver === "undefined"
      ? null
      : new MutationObserver(handleMenuChange);
  if (globalWindow.document.body) {
    menuObserver?.observe(globalWindow.document.body, {
      attributes: true,
      attributeFilter: ["data-menu-open"],
    });
  }

  const setState: ThreeAppHandle["setState"] = (
    updater: ThreeAppHandle["setState"] extends (u: infer U) => void
      ? U
      : never,
  ) => {
    const snapshot = createStateSnapshot(state);
    const partial =
      typeof updater === "function" ? updater(snapshot) : { ...updater };

    let changed = false;
    let nextState = state;
    let pendingOpacity = state.opacity;
    let opacityChanged = false;
    let pendingShapeOpacity = shapeOpacityState;
    let shapeOpacityChanged = false;
    let pendingShapeBlur = shapeBlurState;
    let shapeBlurChanged = false;

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
      pendingShapeOpacity = getVariantShapeOpacity(responsiveVariant);
      pendingShapeBlur = getVariantShapeBlur(responsiveVariant);
      shapeOpacityChanged = true;
      shapeBlurChanged = true;
      commit({
        variantName: partial.variantName,
        variant: createVariantState(responsiveVariant),
        shapeOpacity: { ...pendingShapeOpacity },
        shapeBlur: { ...pendingShapeBlur },
      });
    }

    if (partial.palette) {
      commit({ palette: partial.palette });
    }

    if (partial.theme && partial.theme !== state.theme) {
      const nextPalette = partial.palette ?? getDefaultPalette(partial.theme);
      shapes.applyTheme(partial.theme);

      renderer.toneMappingExposure = getToneMappingExposure(partial.theme);
      pushAppliedVisuals();
      commit({ theme: partial.theme, palette: nextPalette });
    }

    if (typeof partial.brightness === "number") {
      const nextBrightness = clamp(partial.brightness, 0.5, 2);
      if (nextBrightness !== state.brightness) {
        shapes.setBrightness(nextBrightness);
        commit({ brightness: nextBrightness });
      }
    }

    if (
      typeof partial.parallax === "boolean" &&
      partial.parallax !== state.parallax
    ) {
      commit({ parallax: partial.parallax });
    }

    if (
      typeof partial.hovered === "boolean" &&
      partial.hovered !== state.hovered
    ) {
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

    if (
      partial.pointerDriver &&
      partial.pointerDriver !== state.pointerDriver
    ) {
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
      // shapeOpacity explícito SEMPRE vence sobre o valor derivado do variant.
      // Não usamos localChange — sempre commitamos para garantir isolamento entre contextos.
      const updatedOpacity = { ...pendingShapeOpacity };

      (Object.entries(partial.shapeOpacity) as [ShapeId, number][]).forEach(
        ([key, value]) => {
          if (!(key in updatedOpacity)) {
            return;
          }
          updatedOpacity[key] = clamp(value, 0, 1);
        },
      );

      pendingShapeOpacity = updatedOpacity;
      shapeOpacityChanged = true;
      commit({ shapeOpacity: { ...pendingShapeOpacity } });
    }

    if (partial.shapeBlur) {
      const updatedBlur = { ...pendingShapeBlur };
      let localChange = false;

      (Object.entries(partial.shapeBlur) as [ShapeId, number][]).forEach(
        ([key, value]) => {
          if (!(key in updatedBlur)) {
            return;
          }

          const clampedValue = clamp(value, 0, 1);
          if (updatedBlur[key] !== clampedValue) {
            updatedBlur[key] = clampedValue;
            localChange = true;
          }
        },
      );

      if (localChange) {
        pendingShapeBlur = updatedBlur;
        shapeBlurChanged = true;
        commit({ shapeBlur: { ...pendingShapeBlur } });
      }
    }

    if (opacityChanged || shapeOpacityChanged || shapeBlurChanged) {
      visualOpacity = pendingOpacity;
      visualShapeOpacity = { ...pendingShapeOpacity };
      if (shapeBlurChanged) {
        visualShapeBlur = { ...pendingShapeBlur };
      }
    }

    if ("variantTransitionMs" in partial) {
      const nextTransition =
        typeof partial.variantTransitionMs === "number"
          ? Math.max(partial.variantTransitionMs, 0)
          : null;
      if (nextTransition !== state.variantTransitionMs) {
        commit({ variantTransitionMs: nextTransition });
      }
    } else if (
      partial.variantName &&
      partial.variantName !== state.variantName
    ) {
      // Se mudar de variante (rota), define um tempo padrão de transição
      commit({ variantTransitionMs: 1200 });
    }

    if (partial.variant) {
      targetVariantState = createVariantState(partial.variant);
      if (partial.snap) {
        shapes.applyVariant(partial.variant);
        resetVelocities();
      }
      pendingShapeOpacity = getVariantShapeOpacity(partial.variant);
      pendingShapeBlur = getVariantShapeBlur(partial.variant);
      shapeOpacityChanged = true;
      shapeBlurChanged = true;
      commit({
        variant: createVariantState(partial.variant),
        shapeOpacity: { ...pendingShapeOpacity },
        shapeBlur: { ...pendingShapeBlur },
      });
    }

    state = nextState;
    shapeOpacityState = pendingShapeOpacity;
    shapeBlurState = pendingShapeBlur;

    // Snapping (resize, first paint) shows the targets immediately; a normal
    // navigation lets the tick ease opacity/blur there alongside the shapes.
    if (partial.snap || !readyDispatched) {
      snapVisuals();
    }

    if (changed) {
      dispatchStateChange(eventTarget, state);
    }

    if (changed || opacityChanged || shapeOpacityChanged || shapeBlurChanged) {
      syncBlurredRatio();
      wake();
    }
  };

  const dispose = () => {
    if (disposed) {
      return;
    }

    disposed = true;

    cancelFrame();
    if (blurTimer !== null) {
      globalWindow.clearTimeout(blurTimer);
      blurTimer = null;
    }
    menuObserver?.disconnect();
    mobileQuery.removeEventListener("change", handleMobileChange);
    globalWindow.removeEventListener("resize", resize);
    globalWindow.removeEventListener("pointermove", pointerMove);
    globalWindow.removeEventListener("pointerenter", pointerEnter);
    globalWindow.removeEventListener("pointerleave", pointerLeave);
    globalWindow.removeEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );
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
  globalWindow.addEventListener(
    "pointermove",
    pointerMove,
    pointerListenerOptions,
  );
  globalWindow.addEventListener(
    "pointerenter",
    pointerEnter,
    pointerListenerOptions,
  );
  globalWindow.addEventListener(
    "pointerleave",
    pointerLeave,
    pointerListenerOptions,
  );
  globalWindow.addEventListener("visibilitychange", handleVisibilityChange);

  dispatchStateChange(eventTarget, state);

  syncBlurredRatio();

  if (isVisible) {
    wake();
  }

  return handle;
};

export default initScene;
