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
    position: [-0.48, 0.88, 0.18],
    rotation: [0.16, 0.18, 0.42],
  },
  torus270B: {
    position: [-0.52, -0.96, -0.2],
    rotation: [-0.12, 0.22, -0.36],
  },
  semi180A: {
    position: [0.78, 0.36, 0.16],
    rotation: [-0.08, 0.26, -0.22],
  },
  semi180B: {
    position: [0.92, -1.42, 0.1],
    rotation: [0.14, -0.14, -0.28],
  },
  wave: {
    position: [-0.24, 1.98, 0.3],
    rotation: [0.38, -0.22, 0.56],
  },
  sphere: {
    position: [1.24, 1.64, 0.44],
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
  ["#f9d7fb", "#f4f6c6", "#a8f0d6", "#a0c8ff"],
  ["#f9d7fb", "#f4f6c6", "#a8f0d6", "#a0c8ff"],
  ["#f9d7fb", "#f4f6c6", "#a8f0d6", "#a0c8ff"],
  ["#f9d7fb", "#f4f6c6", "#a8f0d6", "#a0c8ff"],
  ["#f9d7fb", "#f4f6c6", "#a8f0d6", "#a0c8ff"],
  ["#f9d7fb", "#f4f6c6", "#a8f0d6", "#a0c8ff"],
];

export const DARK_THEME_PALETTE: GradientPalette = [
  ["#2f3039", "#3a3b45", "#454651", "#52535f"],
  ["#2f3039", "#3a3b45", "#454651", "#52535f"],
  ["#2f3039", "#3a3b45", "#454651", "#52535f"],
  ["#2f3039", "#3a3b45", "#454651", "#52535f"],
  ["#2f3039", "#3a3b45", "#454651", "#52535f"],
  ["#2f3039", "#3a3b45", "#454651", "#52535f"],
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
