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
  ["#f1e8ff", "#e8d9ff", "#d9c4ff", "#ceb5ff"],
  ["#ffe7f2", "#ffd0e6", "#ffb8d8", "#ff8fbb"],
  ["#c8fff4", "#a8faea", "#7eeadf", "#3ecfd0"],
  ["#e8ffc8", "#ccf78f", "#b4ef66", "#9ae752"],
  ["#fff1da", "#ffdcb0", "#ffc785", "#ffae57"],
  ["#dce9ff", "#bcd4ff", "#96baff", "#6d9aff"],
];

export const DARK_THEME_PALETTE: GradientPalette = [
  ["#2c2150", "#42307d", "#6b3fb8", "#b67bff"],
  ["#310f27", "#5a1b47", "#99326f", "#ff6fa7"],
  ["#0b2d32", "#104b52", "#167a7a", "#3fe6d8"],
  ["#142818", "#1f4427", "#2f703a", "#7fe65e"],
  ["#3b230d", "#583315", "#8b4e1f", "#f18c38"],
  ["#101d33", "#1c2d4d", "#2f4b7b", "#5889d6"],
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
