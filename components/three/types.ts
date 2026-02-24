import type { OrthographicCamera, Scene, WebGLRenderer } from "three";
import { clamp } from "@/app/helpers/runtime/index";

export type Vector3Tuple = [number, number, number];

export type ShapeId =
  | "torusSpringAzure"
  | "waveSpringLime"
  | "semiLimeFlamingo"
  | "torusFlamingoLime"
  | "semiFlamingoAzure"
  | "sphereFlamingoSpring";

export type GradientStops = [string, string, string, string];
export type GradientPalette = readonly GradientStops[];

export type PointerDriver = "device" | "manual";

export type PointerTarget = { x: number; y: number };

export type VariantName = "home" | "about" | "work" | "contact";

export type ShapeScale = number | Vector3Tuple;

export type ShapeTransform = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: ShapeScale;
};

export type VariantState = Record<ShapeId, ShapeTransform>;

const createPrimaryMonogramVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [-2.12, 0.05, -1.1],
    rotation: [Math.PI / 2, Math.PI * -1.7, 0],
    scale: [0.18, 0.18, 0.18],
  },
  waveSpringLime: {
    position: [-1.5, -0.15, -2],
    rotation: [0, Math.PI / 1, Math.PI / 1.9],
    scale: [0.15, 0.15, 0.15],
  },
  semiLimeFlamingo: {
    position: [-2.8, -0.2, -0.45],
    rotation: [Math.PI / 2, Math.PI * -0.4, 0],
    scale: [0.13, 0.13, 0.13],
  },
  torusFlamingoLime: {
    position: [-1.8, -0.32, -0.45],
    rotation: [Math.PI / 2, Math.PI * -1.2, 0],
    scale: [0.16, 0.16, 0.16],
  },
  semiFlamingoAzure: {
    position: [-2.6, 0.02, 0.06],
    rotation: [Math.PI / 2, Math.PI * -1.5, 0],
    scale: [0.2, 0.2, 0.2],
  },
  sphereFlamingoSpring: {
    position: [-1.3, -0.5, 0.32],
    rotation: [0, 0, 0],
    scale: 0.14,
  },
});

const createSecondaryMonogramVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [2.7, -0.08, 2.1],
    rotation: [Math.PI / 2, Math.PI * -0.5, 2],
    scale: [0.12, 0.12, 0.12],
  },
  waveSpringLime: {
    position: [2.7, -0.25, 2],
    rotation: [0, Math.PI / 1, Math.PI / 2],
    scale: [0.12, 0.12, 0.12],
  },
  semiLimeFlamingo: {
    position: [1.7, -0.29, -1.5],
    rotation: [Math.PI / 2, Math.PI * -0.6, 0],
    scale: [0.18, 0.18, 0.18],
  },
  torusFlamingoLime: {
    position: [2, 0, -1],
    rotation: [Math.PI / 2, Math.PI * -1.87, 0],
    scale: [0.35, 0.35, 0.35],
  },
  semiFlamingoAzure: {
    position: [2.7, 0.05, 2],
    rotation: [Math.PI / 2, Math.PI * -0.5, 2],
    scale: [0.07, 0.07, 0.07],
  },
  sphereFlamingoSpring: {
    position: [2, 0, 0.28],
    rotation: [0, 0, 0],
    scale: 0.2,
  },
});

const createMenuMonogramVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [-1.7, 0.01, -1],
    rotation: [Math.PI / 2, Math.PI * -1.7, 0],
    scale: [0.26, 0.26, 0.26],
  },
  waveSpringLime: {
    position: [-2.3, 0.97, -0.8],
    rotation: [-2.5, 0, -0.5],
    scale: [0.25, 0.25, 0.25],
  },
  semiLimeFlamingo: {
    position: [-2.7, -0.02, -0.9],
    rotation: [Math.PI / 2, Math.PI * -0.15, 0],
    scale: [0.24, 0.24, 0.24],
  },
  torusFlamingoLime: {
    position: [-1.35, -0.92, -0.7],
    rotation: [Math.PI / 2, Math.PI * -1.2, 0],
    scale: [0.18, 0.18, 0.18],
  },
  semiFlamingoAzure: {
    position: [-2.25, -0.97, -0.65],
    rotation: [Math.PI / 2, Math.PI * -1.45, 0],
    scale: [0.24, 0.24, 0.24],
  },
  sphereFlamingoSpring: {
    position: [-1.8, 0.73, -0.6],
    rotation: [0, 0, 0],
    scale: 0.28,
  },
});

const createContactMonogramVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [0.4, -0.32, -0.95],
    rotation: [Math.PI / 2, Math.PI * -1.1, 0.35],
    scale: [0.26, 0.26, 0.26],
  },
  waveSpringLime: {
    position: [-0.8, 0.78, -0.7],
    rotation: [-2.1, 0.3, -0.6],
    scale: [0.22, 0.22, 0.22],
  },
  semiLimeFlamingo: {
    position: [1.0, 0.45, -0.5],
    rotation: [Math.PI / 2, Math.PI * -0.35, 0.15],
    scale: [0.2, 0.2, 0.2],
  },
  torusFlamingoLime: {
    position: [0.1, -1.02, -0.4],
    rotation: [Math.PI / 2, Math.PI * -1.35, -0.1],
    scale: [0.18, 0.18, 0.18],
  },
  semiFlamingoAzure: {
    position: [-0.7, -0.88, -0.25],
    rotation: [Math.PI / 2, Math.PI * -1.55, 0.2],
    scale: [0.24, 0.24, 0.24],
  },
  sphereFlamingoSpring: {
    position: [0.8, 0.1, -0.1],
    rotation: [0, 0, 0],
    scale: 0.22,
  },
});

//Posição inicial
const createFramedVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [2.85, -1.8, 1.2],
    rotation: [-1.36, 0.92, -0.2],
    scale: [0.75, 0.75, 0.75],
  },
  waveSpringLime: {
    position: [-3.5, 1.5, -1],
    rotation: [-0.14, 0.32, -0.12],
    scale: [0.75, 0.75, 0.75],
  },
  semiLimeFlamingo: {
    position: [2, 2, -0.4],
    rotation: [1.14, -0.42, -0.05],
    scale: [0.75, 0.75, 0.75],
  },
  torusFlamingoLime: {
    position: [0, -2, -0.58],
    rotation: [-0.28, 0.44, 0.92],
    scale: [0.75, 0.75, 0.75],
  },
  semiFlamingoAzure: {
    position: [-2.82, -1.58, -0.8],
    rotation: [1.36, 0, -0.2],
    scale: [0.75, 0.75, 0.75],
  },
  sphereFlamingoSpring: {
    position: [0, 1.5, 0],
    rotation: [0, 0, 0],
    scale: [0.75, 0.75, 0.75],
  },
});

const createWorkVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [-0.5, 0.4, -0.9],
    rotation: [Math.PI / 2, Math.PI * -1.3, 0.1],
    scale: [0.26, 0.26, 0.26],
  },
  waveSpringLime: {
    position: [0.9, -0.5, -0.8],
    rotation: [-1.8, 0.4, -0.5],
    scale: [0.22, 0.22, 0.22],
  },
  semiLimeFlamingo: {
    position: [-1.1, -0.3, -0.6],
    rotation: [Math.PI / 2, Math.PI * -0.25, 0.2],
    scale: [0.2, 0.2, 0.2],
  },
  torusFlamingoLime: {
    position: [0.4, 0.9, -0.5],
    rotation: [Math.PI / 2, Math.PI * -1.5, -0.15],
    scale: [0.18, 0.18, 0.18],
  },
  semiFlamingoAzure: {
    position: [0.6, -0.7, -0.3],
    rotation: [Math.PI / 2, Math.PI * -1.6, 0.1],
    scale: [0.24, 0.24, 0.24],
  },
  sphereFlamingoSpring: {
    position: [-0.9, 0.3, -0.2],
    rotation: [0, 0, 0],
    scale: 0.22,
  },
});

const createContactVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [0.6, 0.5, -1.0],
    rotation: [Math.PI / 2, Math.PI * -0.9, -0.2],
    scale: [0.26, 0.26, 0.26],
  },
  waveSpringLime: {
    position: [-0.5, -0.6, -0.9],
    rotation: [-2.3, 0.2, -0.7],
    scale: [0.22, 0.22, 0.22],
  },
  semiLimeFlamingo: {
    position: [0.9, -0.8, -0.5],
    rotation: [Math.PI / 2, Math.PI * -0.4, 0.3],
    scale: [0.2, 0.2, 0.2],
  },
  torusFlamingoLime: {
    position: [-0.3, 0.7, -0.4],
    rotation: [Math.PI / 2, Math.PI * -1.1, 0.2],
    scale: [0.18, 0.18, 0.18],
  },
  semiFlamingoAzure: {
    position: [-1.0, 0.1, -0.3],
    rotation: [Math.PI / 2, Math.PI * -1.7, -0.1],
    scale: [0.24, 0.24, 0.24],
  },
  sphereFlamingoSpring: {
    position: [0.3, 0.8, -0.15],
    rotation: [0, 0, 0],
    scale: 0.22,
  },
});

export const variantMapping: Record<VariantName, VariantState> = {
  home: createFramedVariant(),
  about: createContactMonogramVariant(),
  work: createWorkVariant(),
  contact: createContactVariant(),
};

// Aspect ratio for which all variant positions were designed (1440/900).
const BASE_ASPECT = 1440 / 900; // 1.6

const cloneScale = (scale: ShapeScale): ShapeScale =>
  Array.isArray(scale) ? ([...scale] as Vector3Tuple) : scale;

const SHAPE_IDS: readonly ShapeId[] = [
  "torusSpringAzure",
  "waveSpringLime",
  "semiLimeFlamingo",
  "torusFlamingoLime",
  "semiFlamingoAzure",
  "sphereFlamingoSpring",
];

/**
 * Used for page-level variants (variantMapping: home / about / work / contact).
 *
 * The orthographic camera is set up as:
 *   left/right = ±aspect   (changes with window)
 *   top/bottom = ±1        (constant)
 *   zoom       = 0.55      (constant)
 *
 * Visible world-space ranges:
 *   X: ±(aspect / zoom)  → shrinks on narrow/portrait screens
 *   Y: ±(1 / zoom)       → constant, never changes
 *
 * So X positions must scale with (currentAspect / baseAspect) so shapes
 * always stay inside the visible frustum on any screen.
 * Y and scale are kept untouched — the frustum height is constant.
 */
// Altura de design para a qual as variantes foram criadas (1440×900).
const BASE_HEIGHT = 900;

/**
 * Used for page-level variants (variantMapping: home / about / work / contact).
 *
 * The orthographic camera is set up as:
 *   left/right = ±aspect   (changes with window)
 *   top/bottom = ±1        (constant)
 *   zoom       = 0.55      (constant)
 *
 * Visible world-space ranges:
 *   X: ±(aspect / zoom)  → shrinks on narrow/portrait screens
 *   Y: ±(1 / zoom)       → constant, never changes
 *
 * So X positions must scale with (currentAspect / baseAspect) so shapes
 * always stay inside the visible frustum on any screen.
 *
 * sizeScale now uses BOTH the aspect ratio AND the viewport height so that:
 *   - Very narrow portrait phones do not produce excessively tiny shapes.
 *   - Tall phones (e.g. 844 px) keep shapes close to their designed size.
 *   - Landscape screens (aspect ≥ 1) are unaffected.
 *
 * Before: clamp(currentAspect, 0.72, 0.8) / BASE_ASPECT
 *   → for a 390×844 phone (aspect 0.46): 0.72 / 1.6 = 0.45  ← too small
 *
 * After: height-relative scale with a gentle lower floor
 *   → for a 390×844 phone (aspect 0.46, height 844): ~0.87  ← natural size
 *   → for a 375×667 phone (aspect 0.56, height 667): ~0.78
 */
export const createResponsiveVariantState = (
  variant: VariantState,
  viewportWidth: number,
  viewportHeight: number,
): VariantState => {
  const currentAspect = viewportWidth / viewportHeight;
  const xScale = currentAspect / BASE_ASPECT;

  let sizeScale: number;
  if (currentAspect >= 1) {
    // Landscape / desktop — shapes stay at their designed size.
    sizeScale = 1;
  } else {
    // Portrait mobile: derive scale from how close the viewport height is to
    // the design height (900 px). This makes viewportHeight genuinely useful
    // instead of only touching it through the aspect ratio.
    const heightRatio = Math.min(viewportHeight / BASE_HEIGHT, 0.6);
    // Blend: 85% driven by height proximity, 15% minimum floor.
    sizeScale = clamp(heightRatio * 0.8 + 0.05, 0.35, 1);
  }

  const responsiveState = {} as VariantState;

  SHAPE_IDS.forEach((shapeId) => {
    const source = variant[shapeId];
    const [px, py, pz] = source.position;
    const baseScale = cloneScale(source.scale);
    const scaledScale = Array.isArray(baseScale)
      ? ([
          baseScale[0] * sizeScale,
          baseScale[1] * sizeScale,
          baseScale[2] * sizeScale,
        ] as Vector3Tuple)
      : (baseScale as number) * sizeScale;

    responsiveState[shapeId] = {
      position: [px * xScale, py, pz] as Vector3Tuple,
      rotation: [...source.rotation] as Vector3Tuple,
      scale: scaledScale,
    };
  });

  return responsiveState;
};

/**
 * Used for monogram variants (hover on home, menu overlay).
 *
 * Monogram shapes are small and tightly composed — they must NOT be
 * distorted by X aspect-ratio scaling. The variant is used as-is, and
 * only a centering offset is applied on narrow screens so the cluster
 * stays visually centred.
 */

export const createResponsiveHeroVariantState = (
  variant: VariantState,
  viewportWidth: number,
  viewportHeight: number,
  centerBelowWidth = 990,
  partiallyCenterBelowWidth = 1700,
): VariantState => {
  // Clone without any X scaling — monogram proportions stay intact.
  const cloned = {} as VariantState;
  SHAPE_IDS.forEach((shapeId) => {
    const source = variant[shapeId];
    cloned[shapeId] = {
      position: [...source.position] as Vector3Tuple,
      rotation: [...source.rotation] as Vector3Tuple,
      scale: cloneScale(source.scale),
    };
  });

  if (viewportWidth > partiallyCenterBelowWidth) {
    return cloned;
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  SHAPE_IDS.forEach((shapeId) => {
    const [x, y] = cloned[shapeId].position;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
    return cloned;
  }

  const offsetX = -((minX + maxX) / 2);
  const offsetY = -((minY + maxY) / 2);

  const applyFullCenter = viewportWidth <= centerBelowWidth;
  const horizontalFactor = applyFullCenter ? 1 : 0.5;
  const verticalFactor = applyFullCenter ? 1 : 0;

  SHAPE_IDS.forEach((shapeId) => {
    const transform = cloned[shapeId];
    const [x, y, z] = transform.position;
    transform.position = [
      x + offsetX * horizontalFactor,
      y + offsetY * verticalFactor,
      z,
    ] as Vector3Tuple;
  });

  return cloned;
};

export const LIGHT_THEME_PALETTE: GradientPalette = [
  ["#ffb3c2", "#ffc3cf", "#ffd4dc", "#ffe4ea"],
  ["#99b9ff", "#aec7ff", "#c3d6ff", "#d8e4ff"],
  ["#78ffd1", "#8effd8", "#a4ffdf", "#baffea"],
  ["#f0ffa6", "#f5ffba", "#f9ffcf", "#fdffe3"],
  ["#ffb3c2", "#f0ffa6", "#78ffd1", "#99b9ff"],
];

export const DARK_THEME_PALETTE: GradientPalette = [
  ["#2b2b33", "#2b2b33", "#2b2b33", "#2b2b33"],
  ["#25252d", "#25252d", "#25252d", "#25252d"],
  ["#303038", "#303038", "#303038", "#303038"],
  ["#27272f", "#27272f", "#27272f", "#27272f"],
  ["#2b2b33", "#2b2b33", "#2b2b33", "#2b2b33"],
];

export type ThemeName = "light" | "dark";

export const DEFAULT_BRIGHTNESS = 2.3;

export type ShapeOpacityState = Record<ShapeId, number>;

export type ThreeAppState = {
  variantName: VariantName;
  variant: VariantState;
  variantTransitionMs: number | null;
  hoverVariants: {
    desktop: VariantState;
    centered: VariantState;
  } | null;
  palette: GradientPalette;
  theme: ThemeName;
  parallax: boolean;
  hovered: boolean;
  cursorBoost: number;
  pointer: PointerTarget;
  pointerDriver: PointerDriver;
  manualPointer: PointerTarget;
  opacity: number;
  shapeOpacity: ShapeOpacityState;
  brightness: number;
  ready: boolean;
};

export type StateUpdaterFn = (
  previous: Readonly<ThreeAppState>,
) => Partial<ThreeAppState>;

export interface ThreeAppHandle {
  setState: (updater: Partial<ThreeAppState> | StateUpdaterFn) => void;
  dispose: () => void;
  bundle: {
    getState: () => Readonly<ThreeAppState>;
    events: EventTarget;
    scene: Scene;
    camera: OrthographicCamera;
    renderer: WebGLRenderer;
    variantMapping: typeof variantMapping;
  };
}

declare global {
  interface Window {
    __THREE_APP__?: ThreeAppHandle;
  }
}

export const createVariantState = (variant: VariantState): VariantState => ({
  torusSpringAzure: {
    position: [...variant.torusSpringAzure.position] as Vector3Tuple,
    rotation: [...variant.torusSpringAzure.rotation] as Vector3Tuple,
    scale: cloneScale(variant.torusSpringAzure.scale),
  },
  waveSpringLime: {
    position: [...variant.waveSpringLime.position] as Vector3Tuple,
    rotation: [...variant.waveSpringLime.rotation] as Vector3Tuple,
    scale: cloneScale(variant.waveSpringLime.scale),
  },
  semiLimeFlamingo: {
    position: [...variant.semiLimeFlamingo.position] as Vector3Tuple,
    rotation: [...variant.semiLimeFlamingo.rotation] as Vector3Tuple,
    scale: cloneScale(variant.semiLimeFlamingo.scale),
  },
  torusFlamingoLime: {
    position: [...variant.torusFlamingoLime.position] as Vector3Tuple,
    rotation: [...variant.torusFlamingoLime.rotation] as Vector3Tuple,
    scale: cloneScale(variant.torusFlamingoLime.scale),
  },
  semiFlamingoAzure: {
    position: [...variant.semiFlamingoAzure.position] as Vector3Tuple,
    rotation: [...variant.semiFlamingoAzure.rotation] as Vector3Tuple,
    scale: cloneScale(variant.semiFlamingoAzure.scale),
  },
  sphereFlamingoSpring: {
    position: [...variant.sphereFlamingoSpring.position] as Vector3Tuple,
    rotation: [...variant.sphereFlamingoSpring.rotation] as Vector3Tuple,
    scale: cloneScale(variant.sphereFlamingoSpring.scale),
  },
});

export const getDefaultPalette = (theme: ThemeName): GradientPalette =>
  theme === "dark" ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE;

export const HERO_LINE_ONE_MONOGRAM = createPrimaryMonogramVariant();
export const HERO_LINE_TWO_MONOGRAM = createSecondaryMonogramVariant();
export const MENU_OVERLAY_MONOGRAM = createMenuMonogramVariant();
