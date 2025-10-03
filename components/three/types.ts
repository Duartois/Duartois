import type { OrthographicCamera, Scene, WebGLRenderer } from "three";

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

const createMonogramVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [-0.95, 0.58, 0.05],
    rotation: [Math.PI / 2, 0.18, Math.PI / 2],
    scale: [0.58, 0.58, 0.58],
  },
  waveSpringLime: {
    position: [-0.95, -0.25, 0],
    rotation: [0, Math.PI / 2, Math.PI / 2],
    scale: [0.54, 0.54, 0.54],
  },
  semiLimeFlamingo: {
    position: [0.45, 0.62, -0.05],
    rotation: [Math.PI / 2, 0, 0.3],
    scale: [0.64, 0.64, 0.64],
  },
  torusFlamingoLime: {
    position: [0.45, -0.62, -0.05],
    rotation: [Math.PI / 2, 0, -0.3],
    scale: [0.64, 0.64, 0.64],
  },
  semiFlamingoAzure: {
    position: [1.05, 0, 0.12],
    rotation: [Math.PI / 2, 0, Math.PI / 2],
    scale: [0.62, 0.62, 0.62],
  },
  sphereFlamingoSpring: {
    position: [-0.18, 0, 0.32],
    rotation: [0, 0, 0],
    scale: 0.45,
  },
});

export const MONOGRAM_VARIANT = createMonogramVariant();

const createFramedVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [2.85, -1.8, -0.2],
    rotation: [-1.36, 0.92, -0.2],
    scale: [0.75, 0.75, 0.75],
  },
  waveSpringLime: {
    position: [-3, 1.5, -1],
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

export const getDefaultPalette = (theme: ThemeName): GradientPalette =>
  theme === "dark" ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE;
