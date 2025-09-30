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

export const variantMapping: Record<VariantName, VariantState> = {
  home: {
    torus270A: {
      position: [-2.15, 1.35, 0.35],
      rotation: [0.54, -0.2, 1.45],
    },
    torus270B: {
      position: [-1.55, -1.3, -0.45],
      rotation: [-0.48, 0.45, -1.15],
    },
    semi180A: {
      position: [1.4, 1.3, 0.1],
      rotation: [0.65, 0.75, -0.22],
    },
    semi180B: {
      position: [2.3, -0.75, -0.28],
      rotation: [-0.56, -0.62, 0.64],
    },
    wave: {
      position: [0.45, 0.15, 0.35],
      rotation: [0.68, 0.2, -0.48],
    },
    sphere: {
      position: [2.35, 0.35, 0.52],
      rotation: [0.35, -0.28, 0.42],
    },
  },
  about: {
    torus270A: {
      position: [1.8, 1.6, 0.4],
      rotation: [0.48, 0.32, 2.12],
    },
    torus270B: {
      position: [-2.1, -1.5, -0.38],
      rotation: [-0.5, -0.35, -2.05],
    },
    semi180A: {
      position: [-0.65, 1.65, 0.25],
      rotation: [0.58, 0.95, 1.62],
    },
    semi180B: {
      position: [1.75, 0.2, -0.18],
      rotation: [-0.45, -0.78, 1.18],
    },
    wave: {
      position: [-2.25, 0.8, 0.18],
      rotation: [0.62, 0.48, 1.05],
    },
    sphere: {
      position: [1.85, -1.95, 0.45],
      rotation: [0.42, 0.25, 0.58],
    },
  },
  work: {
    torus270A: {
      position: [-2.45, 1.95, 0.35],
      rotation: [0.62, -0.38, 1.72],
    },
    torus270B: {
      position: [-0.95, -2.05, -0.42],
      rotation: [-0.58, 0.32, -1.35],
    },
    semi180A: {
      position: [0.3, 1.95, 0.28],
      rotation: [0.68, 0.82, 1.42],
    },
    semi180B: {
      position: [1.95, -0.05, -0.25],
      rotation: [-0.52, -0.74, 0.72],
    },
    wave: {
      position: [1.65, 1.05, 0.1],
      rotation: [0.75, -0.45, 0.35],
    },
    sphere: {
      position: [3.05, -1.05, 0.55],
      rotation: [0.55, 0.22, 0.38],
    },
  },
  contact: {
    torus270A: {
      position: [0.25, 1.7, 0.32],
      rotation: [0.52, 0.18, 0.28],
    },
    torus270B: {
      position: [-0.2, -1.65, -0.35],
      rotation: [-0.52, -0.22, -0.32],
    },
    semi180A: {
      position: [1.35, 1.0, 0.18],
      rotation: [0.62, 0.85, 0.95],
    },
    semi180B: {
      position: [-1.55, 0.3, -0.22],
      rotation: [-0.62, -0.68, -0.85],
    },
    wave: {
      position: [0.15, 0.05, 0.25],
      rotation: [0.78, 0.48, 1.58],
    },
    sphere: {
      position: [0.45, -0.05, 0.42],
      rotation: [0.32, 0.2, 0.3],
    },
  },
  avatar: {
    torus270A: {
      position: [0.1, 1.2, 0.28],
      rotation: [0.65, 0.28, 0.45],
    },
    torus270B: {
      position: [-0.1, -1.15, -0.32],
      rotation: [-0.65, -0.3, -0.45],
    },
    semi180A: {
      position: [1.05, 0.95, 0.32],
      rotation: [0.72, 0.95, 1.12],
    },
    semi180B: {
      position: [-1.05, 0.4, -0.28],
      rotation: [-0.72, -0.75, -1.02],
    },
    wave: {
      position: [0.05, 0, 0.38],
      rotation: [0.85, 0.52, 1.48],
    },
    sphere: {
      position: [1.75, 0.35, 0.6],
      rotation: [0.48, -0.35, 0.62],
    },
  },
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
