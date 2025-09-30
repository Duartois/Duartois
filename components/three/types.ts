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
      position: [-1.95, 1.4, 0.28],
      rotation: [0.55, -0.32, 1.32],
    },
    torus270B: {
      position: [-1.35, -1.25, -0.42],
      rotation: [-0.58, 0.36, -1.08],
    },
    semi180A: {
      position: [1.35, 1.2, 0.22],
      rotation: [0.62, 0.82, -0.18],
    },
    semi180B: {
      position: [2.15, -0.65, -0.34],
      rotation: [-0.5, -0.6, 0.54],
    },
    wave: {
      position: [0.4, 0.05, 0.38],
      rotation: [0.68, 0.16, -0.48],
    },
    sphere: {
      position: [2.25, 0.42, 0.56],
      rotation: [0.36, -0.24, 0.32],
    },
  },
  about: {
    torus270A: {
      position: [1.75, 1.65, 0.34],
      rotation: [0.48, 0.35, 2.1],
    },
    torus270B: {
      position: [-2.3, -1.4, -0.36],
      rotation: [-0.55, -0.32, -2.0],
    },
    semi180A: {
      position: [-0.55, 1.7, 0.26],
      rotation: [0.6, 0.98, 1.52],
    },
    semi180B: {
      position: [1.85, 0.15, -0.22],
      rotation: [-0.42, -0.82, 1.08],
    },
    wave: {
      position: [-2.15, 0.72, 0.2],
      rotation: [0.66, 0.5, 1.08],
    },
    sphere: {
      position: [1.95, -1.9, 0.5],
      rotation: [0.44, 0.28, 0.54],
    },
  },
  work: {
    torus270A: {
      position: [-2.35, 2.05, 0.38],
      rotation: [0.6, -0.4, 1.68],
    },
    torus270B: {
      position: [-0.85, -2.1, -0.4],
      rotation: [-0.6, 0.34, -1.28],
    },
    semi180A: {
      position: [0.4, 2.05, 0.3],
      rotation: [0.7, 0.86, 1.35],
    },
    semi180B: {
      position: [2.05, -0.1, -0.28],
      rotation: [-0.5, -0.76, 0.68],
    },
    wave: {
      position: [1.55, 1.0, 0.14],
      rotation: [0.78, -0.42, 0.32],
    },
    sphere: {
      position: [3.0, -1.0, 0.58],
      rotation: [0.5, 0.18, 0.36],
    },
  },
  contact: {
    torus270A: {
      position: [0.3, 1.75, 0.3],
      rotation: [0.5, 0.2, 0.24],
    },
    torus270B: {
      position: [-0.1, -1.7, -0.32],
      rotation: [-0.55, -0.24, -0.28],
    },
    semi180A: {
      position: [1.4, 1.05, 0.2],
      rotation: [0.64, 0.88, 0.9],
    },
    semi180B: {
      position: [-1.45, 0.35, -0.24],
      rotation: [-0.66, -0.7, -0.8],
    },
    wave: {
      position: [0.2, 0.08, 0.28],
      rotation: [0.82, 0.52, 1.52],
    },
    sphere: {
      position: [0.55, -0.02, 0.44],
      rotation: [0.34, 0.24, 0.28],
    },
  },
  avatar: {
    torus270A: {
      position: [0.15, 1.25, 0.26],
      rotation: [0.62, 0.3, 0.4],
    },
    torus270B: {
      position: [-0.05, -1.2, -0.3],
      rotation: [-0.66, -0.32, -0.4],
    },
    semi180A: {
      position: [1.1, 1.0, 0.34],
      rotation: [0.74, 0.98, 1.08],
    },
    semi180B: {
      position: [-0.98, 0.45, -0.3],
      rotation: [-0.74, -0.78, -0.98],
    },
    wave: {
      position: [0.08, 0.02, 0.4],
      rotation: [0.88, 0.56, 1.42],
    },
    sphere: {
      position: [1.82, 0.38, 0.62],
      rotation: [0.5, -0.32, 0.58],
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
