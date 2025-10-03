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

const PRIMARY_DESKTOP_VARIANT: VariantState = {
  torusSpringAzure: {
    position: [-2.12, 0.05, -1.1],
    rotation: [Math.PI / 2, Math.PI * -1.7, 0],
    scale: 0.18,
  },
  waveSpringLime: {
    position: [-1.5, -0.15, -2],
    rotation: [0, Math.PI, Math.PI / 1.9],
    scale: 0.15,
  },
  semiLimeFlamingo: {
    position: [-2.8, -0.2, -0.45],
    rotation: [Math.PI / 2, Math.PI * -0.4, 0],
    scale: 0.13,
  },
  torusFlamingoLime: {
    position: [-1.8, -0.32, -0.45],
    rotation: [Math.PI / 2, Math.PI * -1.2, 0],
    scale: 0.16,
  },
  semiFlamingoAzure: {
    position: [-2.6, 0.02, 0.06],
    rotation: [Math.PI / 2, Math.PI * -1.5, 0],
    scale: 0.2,
  },
  sphereFlamingoSpring: {
    position: [-1.3, -0.5, 0.32],
    rotation: [0, 0, 0],
    scale: 0.14,
  },
};

const SECONDARY_DESKTOP_VARIANT: VariantState = {
  torusSpringAzure: {
    position: [2.7, -0.08, 2.1],
    rotation: [Math.PI / 2, -Math.PI / 2, 2],
    scale: 0.12,
  },
  waveSpringLime: {
    position: [2.7, -0.25, 2],
    rotation: [0, Math.PI, Math.PI / 2],
    scale: 0.12,
  },
  semiLimeFlamingo: {
    position: [1.7, -0.29, -1.5],
    rotation: [Math.PI / 2, Math.PI * -0.6, 0],
    scale: 0.18,
  },
  torusFlamingoLime: {
    position: [2, 0, -1],
    rotation: [Math.PI / 2, Math.PI * -1.87, 0],
    scale: 0.35,
  },
  semiFlamingoAzure: {
    position: [2.7, 0.05, 2],
    rotation: [Math.PI / 2, -Math.PI / 2, 2],
    scale: 0.07,
  },
  sphereFlamingoSpring: {
    position: [2, 0, 0.28],
    rotation: [0, 0, 0],
    scale: 0.2,
  },
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
  const desktop = createVariantState(PRIMARY_DESKTOP_VARIANT);

  if (alignment === "centered") {
    return shiftVariant(desktop, 2);
  }

  return desktop;
};

const createSecondaryMonogramVariant = (
  alignment: MonogramAlignment = "desktop",
): VariantState => {
  const desktop = createVariantState(SECONDARY_DESKTOP_VARIANT);

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

export const getDefaultPalette = (theme: ThemeName): GradientPalette =>
  theme === "dark" ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE;