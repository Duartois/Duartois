import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";

export type Vector3Tuple = [number, number, number];

export type ShapeId =
  | "torus270A"
  | "torus270B"
  | "semi180A"
  | "semi180B"
  | "wave"
  | "sphere";

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
  torus270A: {
    position: [-1.92, 1.42, 0.18],
    rotation: [0, 0, 0],
  },
  torus270B: {
    position: [-1.28, -1.22, -0.4],
    rotation: [0, 0, 0],
  },
  semi180A: {
    position: [1.32, 1.18, 0.18],
    rotation: [0, 0, 0],
  },
  semi180B: {
    position: [2.18, -0.6, -0.32],
    rotation: [0, 0, 0],
  },
  wave: {
    position: [0.36, 0.04, 0.34],
    rotation: [0, 0, 0],
  },
  sphere: {
    position: [2.22, 0.42, 0.52],
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
  ["#f4ebff", "#dcc8ff", "#c1a6ff", "#9d7aff"],
  ["#ffe8f1", "#ffc4dd", "#ff9ec8", "#ff6faa"],
  ["#d0fff9", "#a7f5ef", "#76e0df", "#2fc4c3"],
  ["#ebffd4", "#c7f7a2", "#a0ed75", "#7bd74b"],
  ["#fff0dd", "#ffd5aa", "#ffb877", "#ff9042"],
  ["#deecff", "#b8d2ff", "#8ab2ff", "#5a8cff"],
];

export const DARK_THEME_PALETTE: GradientPalette = [
  ["#241a44", "#3d2972", "#5f3aa9", "#9b6cf5"],
  ["#2a0d21", "#4f183c", "#862a64", "#e75b9a"],
  ["#07272c", "#0d4149", "#156a6c", "#2fd6cc"],
  ["#112215", "#1a3821", "#295631", "#6cd551"],
  ["#331c0b", "#4d2a12", "#753e1a", "#e0762d"],
  ["#0d192d", "#192941", "#2a4669", "#4f7ecc"],
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
    camera: PerspectiveCamera;
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
  torus270A: {
    position: [...variant.torus270A.position] as Vector3Tuple,
    rotation: [...variant.torus270A.rotation] as Vector3Tuple,
  },
  torus270B: {
    position: [...variant.torus270B.position] as Vector3Tuple,
    rotation: [...variant.torus270B.rotation] as Vector3Tuple,
  },
  semi180A: {
    position: [...variant.semi180A.position] as Vector3Tuple,
    rotation: [...variant.semi180A.rotation] as Vector3Tuple,
  },
  semi180B: {
    position: [...variant.semi180B.position] as Vector3Tuple,
    rotation: [...variant.semi180B.rotation] as Vector3Tuple,
  },
  wave: {
    position: [...variant.wave.position] as Vector3Tuple,
    rotation: [...variant.wave.rotation] as Vector3Tuple,
  },
  sphere: {
    position: [...variant.sphere.position] as Vector3Tuple,
    rotation: [...variant.sphere.rotation] as Vector3Tuple,
  },
});

export const getDefaultPalette = (theme: ThemeName): GradientPalette =>
  theme === "dark" ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE;
