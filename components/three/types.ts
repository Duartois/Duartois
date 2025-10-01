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

export type VariantName = "home" | "about" | "work" | "contact" | "avatar";

export type ShapeScale = number | Vector3Tuple;

export type ShapeTransform = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: ShapeScale;
};

export type VariantState = Record<ShapeId, ShapeTransform>;

const createFramedVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [2.55, -1.58, -0.2],
    rotation: [-1.36, 0.92, -0.2],
    scale: [0.75, 0.75, 0.75],
  },
  waveSpringLime: {
    position: [-3, 1.5, -1],
    rotation: [-0.14, 0.32, -0.12],
    scale: [0.75, 0.75, 0.75],
  },
  semiLimeFlamingo: {
    position: [2, 1.5, -0.4],
    rotation: [1.14, -0.42, -0.05],
    scale: [0.75, 0.75, 0.75],
  },
  torusFlamingoLime: {
    position: [-100.64, -0.62, -0.58],
    rotation: [-0.28, 0.44, 0.92],
    scale: [0.75, 0.75, 0.75],
  },
  semiFlamingoAzure: {
    position: [-2.42, -1.58, -0.8],
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
  avatar: createFramedVariant(),
};

export const LIGHT_THEME_PALETTE: GradientPalette = [
  ["#71ff81", "#94ffa0", "#bfffc6", "#e3ffe6"],
  ["#85b9ff", "#a4caff", "#c8e0ff", "#e7f1ff"],
  ["#f0ff66", "#f4ff8c", "#f8ffba", "#fcffe0"],
  ["#ff5c82", "#ff85a1", "#ffb6c7", "#ffdee6"],
  ["#71ff81", "#85b9ff", "#f0ff66", "#ff5c82"],
];

export const DARK_THEME_PALETTE: GradientPalette = [
  ["#1b4036", "#235342", "#2d6851", "#377b5f"],
  ["#1d2947", "#233155", "#2a3a66", "#314378"],
  ["#3c3f21", "#474a27", "#545730", "#626638"],
  ["#3f2a39", "#4c3143", "#5b3a4f", "#6c455d"],
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
