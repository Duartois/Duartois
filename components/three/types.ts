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
    position: [-1.68, 1.58, 0.16],
    rotation: [0.08, -0.1, 0.04],
  },
  torus270B: {
    position: [-1.86, -1.24, -0.36],
    rotation: [-0.12, 0.18, 0.28],
  },
  semi180A: {
    position: [1.74, 1.36, 0.18],
    rotation: [-0.05, 0.06, -0.08],
  },
  semi180B: {
    position: [2.04, -0.92, -0.28],
    rotation: [0.07, -0.05, -0.22],
  },
  wave: {
    position: [0.08, 0.18, 0.42],
    rotation: [0, 0, 0.08],
  },
  sphere: {
    position: [0.96, -1.4, 0.54],
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
  ["#f9e9ff", "#e6c7ff", "#d0a4ff", "#b67cff"],
  ["#ffe9fb", "#ffc4ef", "#ffa1e3", "#ff77d2"],
  ["#e8fff6", "#c2ffe6", "#99f7d6", "#64e8c2"],
  ["#f3ffe6", "#d8ffb8", "#baff85", "#8af55d"],
  ["#fff4e5", "#ffd5b5", "#ffb886", "#ff9362"],
  ["#e9f6ff", "#c3e4ff", "#9accff", "#6faeff"],
];

export const DARK_THEME_PALETTE: GradientPalette = [
  ["#2b1a44", "#3c2b63", "#5b3f96", "#8e63e6"],
  ["#3b1031", "#5a1f50", "#872c77", "#ff63c5"],
  ["#0a2c25", "#11433a", "#146259", "#21d7a8"],
  ["#12240f", "#1d3a18", "#2a5927", "#6dff63"],
  ["#331d0f", "#4d2a16", "#72401f", "#ffa564"],
  ["#12203c", "#1c3056", "#2f4f8b", "#6aa7ff"],
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
