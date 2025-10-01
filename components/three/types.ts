import type { OrthographicCamera, Scene, WebGLRenderer } from "three";

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
  ["#B9FFB2", "#A9EEFF", "#B6B1FF", "#FFB6C6"],
  ["#B9FFB2", "#A9EEFF", "#B6B1FF", "#FFB6C6"],
  ["#B9FFB2", "#A9EEFF", "#B6B1FF", "#FFB6C6"],
  ["#B9FFB2", "#A9EEFF", "#B6B1FF", "#FFB6C6"],
  ["#B9FFB2", "#A9EEFF", "#B6B1FF", "#FFB6C6"],
  ["#B9FFB2", "#A9EEFF", "#B6B1FF", "#FFB6C6"],
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
