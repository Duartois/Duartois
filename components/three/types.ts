import type { OrthographicCamera, Scene, WebGLRenderer } from "three";

export type Vector3Tuple = [number, number, number];

export type ShapeId =
  | "torus"
  | "capsule"
  | "sphere"
  | "torusKnot"
  | "octahedron";

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
  torus: {
    position: [-2.35, -0.85, 0.1],
    rotation: [0.22, 0.58, 0.34],
  },
  capsule: {
    position: [1.15, 1.05, -1.1],
    rotation: [-0.28, 0.46, 0.72],
  },
  sphere: {
    position: [-0.2, 0.1, 1.2],
    rotation: [0.0, 0.0, 0.0],
  },
  torusKnot: {
    position: [-1.05, 0.78, 0.65],
    rotation: [0.45, -0.24, 0.36],
  },
  octahedron: {
    position: [1.85, -0.52, -0.45],
    rotation: [-0.38, 0.26, -0.48],
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
  ["#ff6bc2", "#ff93da", "#ffbef1", "#ffe8ff"],
  ["#89d9ff", "#a2e4ff", "#c2edff", "#ddf7ff"],
  ["#78ff81", "#90ff98", "#abffb5", "#c8ffd2"],
  ["#f1ff6b", "#f6ff8f", "#fbffb4", "#ffffd8"],
  ["#ff6bc2", "#89d9ff", "#78ff81", "#f1ff6b"],
];

export const DARK_THEME_PALETTE: GradientPalette = [
  ["#5a2d4d", "#783864", "#96417c", "#b94f97"],
  ["#1d3a5a", "#214569", "#285580", "#306896"],
  ["#194f36", "#1f6043", "#277553", "#318865"],
  ["#4c4f26", "#5d632d", "#6f7836", "#849044"],
  ["#5a2d4d", "#1d3a5a", "#194f36", "#4c4f26"],
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
  torus: {
    position: [...variant.torus.position] as Vector3Tuple,
    rotation: [...variant.torus.rotation] as Vector3Tuple,
  },
  capsule: {
    position: [...variant.capsule.position] as Vector3Tuple,
    rotation: [...variant.capsule.rotation] as Vector3Tuple,
  },
  sphere: {
    position: [...variant.sphere.position] as Vector3Tuple,
    rotation: [...variant.sphere.rotation] as Vector3Tuple,
  },
  torusKnot: {
    position: [...variant.torusKnot.position] as Vector3Tuple,
    rotation: [...variant.torusKnot.rotation] as Vector3Tuple,
  },
  octahedron: {
    position: [...variant.octahedron.position] as Vector3Tuple,
    rotation: [...variant.octahedron.rotation] as Vector3Tuple,
  },
});

export const getDefaultPalette = (theme: ThemeName): GradientPalette =>
  theme === "dark" ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE;
