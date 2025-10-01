import type { OrthographicCamera, Scene, WebGLRenderer } from "three";

export type Vector3Tuple = [number, number, number];

export type ShapeId =
  | "torus"
  | "sphere"
  | "icosahedron"
  | "torusKnot"
  | "box";

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
<<<<<<< HEAD
  torus: {
    position: [-2.0, 0.2, 0.0],
    rotation: [0.0, 0.0, 0.0],
  },
  sphere: {
    position: [1.2, 0.6, -0.6],
    rotation: [0.0, 0.0, 0.0],
  },
  icosahedron: {
    position: [0.0, -0.8, 1.2],
    rotation: [0.0, 0.0, 0.0],
  },
  torusKnot: {
    position: [2.0, 0.1, 0.8],
    rotation: [0.0, 0.0, 0.0],
  },
  box: {
    position: [-1.1, -0.5, -1.2],
    rotation: [0.0, 0.0, 0.0],
=======
  // 3) C-torus grande (direita)
  torus270A: {
    position: [ 1.18,  0.32,  0.00],
    rotation: [ 0.00,  0.00, -0.18],
  },
  // 6) Arco inferior grande (centro)
  torus270B: {
    position: [ 0.04, -1.08,  0.00],
    rotation: [ 0.00,  0.00,  0.06],
  },
  // 5) C-torus médio (centro-esquerda)
  semi180A: {
    position: [ 0.10, -0.16,  0.00],
    rotation: [ 0.00,  0.00,  0.18],
  },
  // 4) Crescente/feijão (esquerda)
  semi180B: {
    position: [-0.54,  0.02,  0.00],
    rotation: [ 0.00,  0.00, -0.06],
  },
  // 1) S-worm superior esquerdo
  wave: {
    position: [-1.18,  1.10,  0.00],
    rotation: [ 0.00,  0.00, -0.06],
  },
  // 2) Esfera pequena
  sphere: {
    position: [ 0.04,  0.98,  0.00],
    rotation: [ 0.00,  0.00,  0.00],
>>>>>>> b2054ea5e1c2b985ba486d7dce3322416ea89f15
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
  ["#ff7fbd", "#ff9ccd", "#ffd6a3", "#fff3b3"],
  ["#f7f7f9", "#ededf0", "#e3e3e7", "#d8d8dd"],
  ["#5b8cff", "#8a7bff", "#b879ff", "#ff9bcc"],
  ["#00d5c0", "#38e1b4", "#77eea6", "#c2f6a2"],
  ["#3ad986", "#b7e867", "#ffe08a", "#ffc09f"],
  ["#a6ffd7", "#c1ffe6", "#ffb3df", "#ff89c6"],
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
  sphere: {
    position: [...variant.sphere.position] as Vector3Tuple,
    rotation: [...variant.sphere.rotation] as Vector3Tuple,
  },
  icosahedron: {
    position: [...variant.icosahedron.position] as Vector3Tuple,
    rotation: [...variant.icosahedron.rotation] as Vector3Tuple,
  },
  torusKnot: {
    position: [...variant.torusKnot.position] as Vector3Tuple,
    rotation: [...variant.torusKnot.rotation] as Vector3Tuple,
  },
  box: {
    position: [...variant.box.position] as Vector3Tuple,
    rotation: [...variant.box.rotation] as Vector3Tuple,
  },
});

export const getDefaultPalette = (theme: ThemeName): GradientPalette =>
  theme === "dark" ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE;
