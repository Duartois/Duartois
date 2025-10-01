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

export type ShapeTransform = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
};

export type VariantState = Record<ShapeId, ShapeTransform>;

const createFramedVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [-1.85, 0.58, 0.2],
    rotation: [0.36, 0.92, -0.2],
  },
  waveSpringLime: {
    position: [0.12, 1.35, -0.35],
    rotation: [-0.14, 0.32, 0.12],
  },
  semiLimeFlamingo: {
    position: [1.68, 0.15, 0.55],
    rotation: [0.14, -0.82, -0.05],
  },
  torusFlamingoLime: {
    position: [-0.64, -0.62, -0.58],
    rotation: [-0.28, 0.44, 0.92],
  },
  semiFlamingoAzure: {
    position: [1.42, -1.02, -0.8],
    rotation: [0.18, -0.54, 0.66],
  },
  sphereFlamingoSpring: {
    position: [0.28, -1.68, 0.72],
    rotation: [0, 0, 0],
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
  ["#78ffd1", "#89ffd8", "#93ffe0", "#99ffea"],
  ["#99b9ff", "#a4c3ff", "#b4d2ff", "#c4e0ff"],
  ["#f0ffa6", "#f3ffb5", "#f6ffc6", "#f9ffd7"],
  ["#ffb3f2", "#ffc0f4", "#ffd2f8", "#ffe3fb"],
  ["#78ffd1", "#99b9ff", "#f0ffa6", "#ffb3f2"],
];

export const DARK_THEME_PALETTE: GradientPalette = [
  ["#1b4036", "#235342", "#2d6851", "#377b5f"],
  ["#1d2947", "#233155", "#2a3a66", "#314378"],
  ["#3c3f21", "#474a27", "#545730", "#626638"],
  ["#3f2a39", "#4c3143", "#5b3a4f", "#6c455d"],
  ["#2b2b33", "#2b2b33", "#2b2b33", "#2b2b33"],
];

export type ThemeName = "light" | "dark";

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
  },
  waveSpringLime: {
    position: [...variant.waveSpringLime.position] as Vector3Tuple,
    rotation: [...variant.waveSpringLime.rotation] as Vector3Tuple,
  },
  semiLimeFlamingo: {
    position: [...variant.semiLimeFlamingo.position] as Vector3Tuple,
    rotation: [...variant.semiLimeFlamingo.rotation] as Vector3Tuple,
  },
  torusFlamingoLime: {
    position: [...variant.torusFlamingoLime.position] as Vector3Tuple,
    rotation: [...variant.torusFlamingoLime.rotation] as Vector3Tuple,
  },
  semiFlamingoAzure: {
    position: [...variant.semiFlamingoAzure.position] as Vector3Tuple,
    rotation: [...variant.semiFlamingoAzure.rotation] as Vector3Tuple,
  },
  sphereFlamingoSpring: {
    position: [...variant.sphereFlamingoSpring.position] as Vector3Tuple,
    rotation: [...variant.sphereFlamingoSpring.rotation] as Vector3Tuple,
  },
});

export const getDefaultPalette = (theme: ThemeName): GradientPalette =>
  theme === "dark" ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE;
