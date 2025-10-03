import type { OrthographicCamera, Scene, WebGLRenderer } from "three";

export type Vector3Tuple = [number, number, number];

export type ShapeId =
  | "torusSpringAzure"
  | "waveSpringLime"
  | "semiLimeFlamingo"
  | "torusFlamingoLime"
  | "semiFlamingoAzure"
  | "sphereFlamingoSpring";

const SHAPE_IDS: readonly ShapeId[] = [
  "torusSpringAzure",
  "waveSpringLime",
  "semiLimeFlamingo",
  "torusFlamingoLime",
  "semiFlamingoAzure",
  "sphereFlamingoSpring",
] as const;

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

export type MonogramAlignment = "desktop" | "centered";

export type HoverVariantSet = {
  desktop: VariantState;
  centered: VariantState;
};

const cloneScale = (scale: ShapeScale): ShapeScale =>
  Array.isArray(scale) ? ([...scale] as Vector3Tuple) : scale;

const addVector3 = (a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

const multiplyScale = (scale: ShapeScale, factor: ShapeScale): ShapeScale => {
  if (Array.isArray(scale)) {
    const base = scale as Vector3Tuple;
    if (Array.isArray(factor)) {
      const ratios = factor as Vector3Tuple;
      return [
        base[0] * ratios[0],
        base[1] * ratios[1],
        base[2] * ratios[2],
      ] as Vector3Tuple;
    }
    return [base[0] * factor, base[1] * factor, base[2] * factor] as Vector3Tuple;
  }

  const base = scale ?? 1;
  if (Array.isArray(factor)) {
    const ratios = factor as Vector3Tuple;
    return base * ratios[0];
  }

  return base * factor;
};

type TransformAdjustments = {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scaleRatio?: ShapeScale;
};

const applyAdjustments = (
  base: ShapeTransform,
  adjustments?: TransformAdjustments,
): ShapeTransform => {
  if (!adjustments) {
    return {
      position: [...base.position] as Vector3Tuple,
      rotation: [...base.rotation] as Vector3Tuple,
      scale: cloneScale(base.scale),
    };
  }

  const position = adjustments.position
    ? addVector3(base.position, adjustments.position)
    : ([...base.position] as Vector3Tuple);

  const rotation = adjustments.rotation
    ? addVector3(base.rotation, adjustments.rotation)
    : ([...base.rotation] as Vector3Tuple);

  const scale = adjustments.scaleRatio
    ? multiplyScale(base.scale, adjustments.scaleRatio)
    : cloneScale(base.scale);

  return { position, rotation, scale };
};

const createFramedVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [2.85, -1.8, -0.2],
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

const PRIMARY_DESKTOP_ADJUSTMENTS: Record<ShapeId, TransformAdjustments> = {
  torusSpringAzure: {
    position: [-4.97, 1.85, -0.9],
    rotation: [Math.PI / 2 + 1.36, Math.PI * -1.7 - 0.92, 0.2],
    scaleRatio: 0.18 / 0.75,
  },
  waveSpringLime: {
    position: [2, -1.65, -1],
    rotation: [0.14, Math.PI - 0.32, Math.PI / 1.9 + 0.12],
    scaleRatio: 0.15 / 0.75,
  },
  semiLimeFlamingo: {
    position: [-4.8, -2.2, -0.05],
    rotation: [Math.PI / 2 - 1.14, Math.PI * -0.4 + 0.42, 0.05],
    scaleRatio: 13 / 75,
  },
  torusFlamingoLime: {
    position: [-1.8, 1.68, 0.13],
    rotation: [Math.PI / 2 + 0.28, Math.PI * -1.2 - 0.44, -0.92],
    scaleRatio: 16 / 75,
  },
  semiFlamingoAzure: {
    position: [0.22, 1.6, 0.86],
    rotation: [Math.PI / 2 - 1.36, Math.PI * -1.5, 0.2], // abertura para baixo
    scaleRatio: 4 / 15,
  },
  sphereFlamingoSpring: {
    position: [-1.3, -2, 0.32],
    scaleRatio: 14 / 75,
  },
};

const SECONDARY_DESKTOP_ADJUSTMENTS: Record<ShapeId, TransformAdjustments> = {
  torusSpringAzure: {
    position: [-0.15, 1.72, 2.3],
    rotation: [Math.PI / 2 + 1.36, Math.PI * -0.5 - 0.92, 2.2],
    scaleRatio: 0.12 / 0.75,
  },
  waveSpringLime: {
    position: [6.2, -1.75, 3],
    rotation: [0.14, Math.PI - 0.32, Math.PI / 2 + 0.12],
    scaleRatio: 0.12 / 0.75,
  },
  semiLimeFlamingo: {
    position: [-0.3, -2.29, -1.1],
    rotation: [Math.PI / 2 - 1.14, Math.PI * -0.6 + 0.42, 0.05],
    scaleRatio: 0.18 / 0.75,
  },
  torusFlamingoLime: {
    position: [2, 2, -0.42],
    rotation: [Math.PI / 2 + 0.28, Math.PI * -1.87 - 0.44, -0.92],
    scaleRatio: 0.35 / 0.75,
  },
  semiFlamingoAzure: {
    position: [5.52, 1.63, 2.8],
    rotation: [Math.PI / 2 - 1.36, Math.PI * -0.5, 2.2],
    scaleRatio: 0.07 / 0.75,
  },
  sphereFlamingoSpring: {
    position: [2, -1.5, 0.28],
    scaleRatio: 4 / 15,
  },
};

const applyAdjustmentsToFramedVariant = (
  adjustments: Record<ShapeId, TransformAdjustments>,
): VariantState => {
  const base = createFramedVariant();

  return SHAPE_IDS.reduce<VariantState>((acc, id) => {
    acc[id] = applyAdjustments(base[id], adjustments[id]);
    return acc;
  }, {} as VariantState);
};

const shiftPosition = (position: Vector3Tuple, deltaX: number): Vector3Tuple => [
  position[0] + deltaX,
  position[1],
  position[2],
];

const shiftVariant = (variant: VariantState, deltaX: number): VariantState => ({
  torusSpringAzure: {
    position: shiftPosition(variant.torusSpringAzure.position, deltaX),
    rotation: [...variant.torusSpringAzure.rotation] as Vector3Tuple,
    scale: Array.isArray(variant.torusSpringAzure.scale)
      ? ([...variant.torusSpringAzure.scale] as Vector3Tuple)
      : variant.torusSpringAzure.scale,
  },
  waveSpringLime: {
    position: shiftPosition(variant.waveSpringLime.position, deltaX),
    rotation: [...variant.waveSpringLime.rotation] as Vector3Tuple,
    scale: Array.isArray(variant.waveSpringLime.scale)
      ? ([...variant.waveSpringLime.scale] as Vector3Tuple)
      : variant.waveSpringLime.scale,
  },
  semiLimeFlamingo: {
    position: shiftPosition(variant.semiLimeFlamingo.position, deltaX),
    rotation: [...variant.semiLimeFlamingo.rotation] as Vector3Tuple,
    scale: Array.isArray(variant.semiLimeFlamingo.scale)
      ? ([...variant.semiLimeFlamingo.scale] as Vector3Tuple)
      : variant.semiLimeFlamingo.scale,
  },
  torusFlamingoLime: {
    position: shiftPosition(variant.torusFlamingoLime.position, deltaX),
    rotation: [...variant.torusFlamingoLime.rotation] as Vector3Tuple,
    scale: Array.isArray(variant.torusFlamingoLime.scale)
      ? ([...variant.torusFlamingoLime.scale] as Vector3Tuple)
      : variant.torusFlamingoLime.scale,
  },
  semiFlamingoAzure: {
    position: shiftPosition(variant.semiFlamingoAzure.position, deltaX),
    rotation: [...variant.semiFlamingoAzure.rotation] as Vector3Tuple,
    scale: Array.isArray(variant.semiFlamingoAzure.scale)
      ? ([...variant.semiFlamingoAzure.scale] as Vector3Tuple)
      : variant.semiFlamingoAzure.scale,
  },
  sphereFlamingoSpring: {
    position: shiftPosition(variant.sphereFlamingoSpring.position, deltaX),
    rotation: [...variant.sphereFlamingoSpring.rotation] as Vector3Tuple,
    scale: Array.isArray(variant.sphereFlamingoSpring.scale)
      ? ([...variant.sphereFlamingoSpring.scale] as Vector3Tuple)
      : variant.sphereFlamingoSpring.scale,
  },
});

const createPrimaryMonogramVariant = (
  alignment: MonogramAlignment = "desktop",
): VariantState => {
  const desktop = applyAdjustmentsToFramedVariant(PRIMARY_DESKTOP_ADJUSTMENTS);

  if (alignment === "centered") {
    return shiftVariant(desktop, 2);
  }

  return desktop;
};

const createSecondaryMonogramVariant = (
  alignment: MonogramAlignment = "desktop",
): VariantState => {
  const desktop = applyAdjustmentsToFramedVariant(SECONDARY_DESKTOP_ADJUSTMENTS);

  if (alignment === "centered") {
    return shiftVariant(desktop, -2);
  }

  return desktop;
};

export const HERO_LINE_ONE_MONOGRAM = createPrimaryMonogramVariant("desktop");
export const HERO_LINE_ONE_MONOGRAM_CENTERED =
  createPrimaryMonogramVariant("centered");
export const HERO_LINE_TWO_MONOGRAM = createSecondaryMonogramVariant("desktop");
export const HERO_LINE_TWO_MONOGRAM_CENTERED =
  createSecondaryMonogramVariant("centered");

export const variantMapping: Record<VariantName, VariantState> = {
  home: createFramedVariant(),
  about: createFramedVariant(),
  work: createFramedVariant(),
  contact: createFramedVariant(),
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

export const DEFAULT_BRIGHTNESS = 1.2;

export type ThreeAppState = {
  variantName: VariantName;
  variant: VariantState;
  palette: GradientPalette;
  theme: ThemeName;
  parallax: boolean;
  hovered: boolean;
  hoverAlignment: MonogramAlignment | null;
  hoverVariants: HoverVariantSet | null;
  cursorBoost: number;
  pointer: PointerTarget;
  pointerDriver: PointerDriver;
  manualPointer: PointerTarget;
  opacity: number;
  brightness: number;
  ready: boolean;
};

export type StateUpdater =
  | Partial<ThreeAppState>
  | ((previous: Readonly<ThreeAppState>) => Partial<ThreeAppState>);

export interface ThreeAppHandle {
  setState: (updater: StateUpdater) => void;
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