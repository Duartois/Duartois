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

export type VariantName = "home" | "about" | "work" | "contact" | "avatar";

export type ShapeTransform = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
};

export type VariantState = Record<ShapeId, ShapeTransform>;

export const variantMapping: Record<VariantName, VariantState> = {
  home: {
    torus270A: {
      position: [-1.8, 1.35, 0.1],
      rotation: [0.32, -0.1, 1.28],
    },
    torus270B: {
      position: [-1.6, -1.25, -0.05],
      rotation: [-0.36, 0.12, -1.22],
    },
    semi180A: {
      position: [1.18, 1.05, 0.14],
      rotation: [0.26, 0.48, -0.32],
    },
    semi180B: {
      position: [1.9, -0.72, -0.1],
      rotation: [-0.34, -0.38, 0.54],
    },
    wave: {
      position: [0.6, 0.25, 0],
      rotation: [0.1, 0.35, -0.28],
    },
    sphere: {
      position: [2.35, -0.2, 0.08],
      rotation: [0.22, -0.12, 0.58],
    },
  },
  about: {
    torus270A: {
      position: [1.5, 1.65, 0.18],
      rotation: [0.28, 0.06, 2.35],
    },
    torus270B: {
      position: [-1.75, -1.4, -0.12],
      rotation: [-0.34, -0.1, -2.18],
    },
    semi180A: {
      position: [-0.35, 1.5, 0.08],
      rotation: [0.3, 0.4, 1.7],
    },
    semi180B: {
      position: [1.65, 0.15, -0.06],
      rotation: [-0.22, -0.45, 1.05],
    },
    wave: {
      position: [-2.15, 0.75, 0.04],
      rotation: [0.12, 0.28, 0.95],
    },
    sphere: {
      position: [1.9, -1.85, 0.12],
      rotation: [0.18, 0.16, 0.38],
    },
  },
  work: {
    torus270A: {
      position: [-2.35, 1.85, 0.16],
      rotation: [0.36, -0.22, 1.62],
    },
    torus270B: {
      position: [-0.85, -1.85, -0.08],
      rotation: [-0.42, 0.18, -1.28],
    },
    semi180A: {
      position: [0.4, 1.8, 0.12],
      rotation: [0.38, 0.28, 1.32],
    },
    semi180B: {
      position: [1.85, -0.1, -0.1],
      rotation: [-0.28, -0.42, 0.62],
    },
    wave: {
      position: [1.55, 0.95, 0.02],
      rotation: [0.22, -0.38, 0.22],
    },
    sphere: {
      position: [2.95, -0.95, 0.1],
      rotation: [0.34, 0.14, 0.28],
    },
  },
  contact: {
    torus270A: {
      position: [0, 1.55, 0.1],
      rotation: [0.16, 0.05, 0.08],
    },
    torus270B: {
      position: [0, -1.55, -0.05],
      rotation: [-0.18, -0.05, -0.12],
    },
    semi180A: {
      position: [1.2, 0.95, 0.08],
      rotation: [0.3, 0.35, 0.72],
    },
    semi180B: {
      position: [-1.4, 0.2, -0.08],
      rotation: [-0.3, -0.28, -0.68],
    },
    wave: {
      position: [0, 0, 0],
      rotation: [0.18, 0.32, 1.48],
    },
    sphere: {
      position: [0.2, -0.1, 0.04],
      rotation: [0.1, 0.08, 0.16],
    },
  },
  avatar: {
    torus270A: {
      position: [0, 1.05, 0.08],
      rotation: [0.3, 0.12, 0.24],
    },
    torus270B: {
      position: [0, -1.05, -0.08],
      rotation: [-0.3, -0.12, -0.24],
    },
    semi180A: {
      position: [0.95, 0.85, 0.14],
      rotation: [0.32, 0.4, 0.92],
    },
    semi180B: {
      position: [-0.95, 0.35, -0.12],
      rotation: [-0.34, -0.3, -0.82],
    },
    wave: {
      position: [0, 0, 0.12],
      rotation: [0.4, 0.2, 1.4],
    },
    sphere: {
      position: [1.6, 0.2, 0.3],
      rotation: [0.2, -0.15, 0.45],
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
  pointer: { x: number; y: number };
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
