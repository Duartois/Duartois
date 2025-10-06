import type { OrthographicCamera, Scene, WebGLRenderer } from "three";

export type Vector3Tuple = [number, number, number];

export type ShapeId =
  | "torusSpringAzure"
  | "waveSpringLime"
  | "semiLimeFlamingo"
  | "torusFlamingoLime"
  | "semiFlamingoAzure"
  | "sphereFlamingoSpring";

export type GradientStops = [string, string, string, string];
export type GradientPalette = readonly GradientStops[];

export type PointerDriver = "device" | "manual";

export type PointerTarget = { x: number; y: number };

export type VariantName = "home" | "about" | "work" | "contact";

export type ShapeScale = number | Vector3Tuple;

export type ShapeTransform = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: ShapeScale;
};

export type VariantState = Record<ShapeId, ShapeTransform>;

const createPrimaryMonogramVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [-2.12, 0.05, -1.10],
    rotation: [Math.PI / 2, Math.PI * -1.7, 0],
    scale: [0.18, 0.18, 0.18],
  },
  waveSpringLime: {
    position: [-1.5, -0.15, -2],
    rotation: [0, Math.PI / 1, Math.PI / 1.9],
    scale: [0.15, 0.15, 0.15],
  },
  semiLimeFlamingo: {
    position: [-2.8, -0.2, -0.45],
    rotation: [Math.PI / 2, Math.PI * -0.4, 0],
    scale: [0.13, 0.13, 0.13],
  },
  torusFlamingoLime: {
    position: [-1.8, -0.32, -0.45],
    rotation: [Math.PI / 2, Math.PI * -1.2, 0],
    scale: [0.16, 0.16, 0.16],
  },
  semiFlamingoAzure: {
    position: [-2.60, 0.02, 0.06],
    rotation: [Math.PI / 2, Math.PI * -1.5, 0], // abertura para baixo
    scale: [0.20, 0.20, 0.20],
  },
  sphereFlamingoSpring: {
    position: [-1.3, -0.5, 0.32],
    rotation: [0, 0, 0],
    scale: 0.14,
  },
});

const createSecondaryMonogramVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [2.7, -0.08, 2.1],
    rotation: [Math.PI / 2, Math.PI * -0.5, 2],
    scale: [0.12, 0.12, 0.12],
  },
  waveSpringLime: {
    position: [2.7, -0.25, 2],
    rotation: [0, Math.PI / 1, Math.PI / 2],
    scale: [0.12, 0.12, 0.12],
  },
  semiLimeFlamingo: {
    position: [1.7, -0.29, -1.5],
    rotation: [Math.PI / 2, Math.PI * -0.6, 0],
    scale: [0.18, 0.18, 0.18],
  },
  torusFlamingoLime: {
    position: [2, 0, -1],
    rotation: [Math.PI / 2, Math.PI * -1.87, 0],
    scale: [0.35, 0.35, 0.35],
  },
  semiFlamingoAzure: {
    position: [2.7, 0.05, 2],
    rotation: [Math.PI / 2, Math.PI * -0.5, 2],
    scale: [0.07, 0.07, 0.07],
  },
  sphereFlamingoSpring: {
    position: [2, 0, 0.28],
    rotation: [0, 0, 0],
    scale: 0.2,
  },
});

const createMenuMonogramVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [-1.7
      , 0.01, 1],
    rotation: [Math.PI / 2, Math.PI * -1.7, 0],
    scale: [0.26, 0.26, 0.26],
  },
  waveSpringLime: {
    position: [-2.3, 0.97, 1],
    rotation: [1, 0.7, Math.PI / 0.5],
    scale: [0.25, 0.25, 0.25],
  },
  semiLimeFlamingo: {
    position: [-2.7, -0.02, 1],
    rotation: [Math.PI / 2, Math.PI * -0.15, 0],
    scale: [0.24, 0.24, 0.24],
  },
  torusFlamingoLime: {
    position: [-1.35, -0.92, 1],
    rotation: [Math.PI / 2, Math.PI * -1.2, 0],
    scale: [0.18, 0.18, 0.18],
  },
  semiFlamingoAzure: {
    position: [-2.25, -0.97, 1],
    rotation: [Math.PI / 2, Math.PI * -1.45, 0],
    scale: [0.24, 0.24, 0.24],
  },
  sphereFlamingoSpring: {
    position: [-1.8, 0.81, 1],
    rotation: [0, 0, 0],
    scale: 0.28,
  },
});

export const HERO_LINE_ONE_MONOGRAM = createPrimaryMonogramVariant();
export const HERO_LINE_TWO_MONOGRAM = createSecondaryMonogramVariant();
export const MENU_OVERLAY_MONOGRAM = createMenuMonogramVariant();


//Posição inicial
const createFramedVariant = (): VariantState => ({
  torusSpringAzure: {
    position: [2.85, -1.8, -0.2],
    rotation: [-1.36, 0.92, -0.2],
    scale: [0.75, 0.75, 0.75],
  },
  waveSpringLime: {
    position: [-3.5, 1.5, -1],
    rotation: [-0.14, 0.32, -0.12],
    scale: [0.75, 0.75, 0.75],
  },
  semiLimeFlamingo: {
    position: [2, 2, -0.4],
    rotation: [1.14, -0.42, -0.05],
    scale: [0.75, 0.75, 0.75],
  },
  torusFlamingoLime: {
    position: [0, -2, -0.58],
    rotation: [-0.28, 0.44, 0.92],
    scale: [0.75, 0.75, 0.75],
  },
  semiFlamingoAzure: {
    position: [-2.82, -1.58, -0.8],
    rotation: [1.36, 0, -0.2],
    scale: [0.75, 0.75, 0.75],
  },
  sphereFlamingoSpring: {
    position: [0, 1.5, 0],
    rotation: [0, 0, 0],
    scale: [0.75, 0.75, 0.75],
  },
});

export const variantMapping: Record<VariantName, VariantState> = {
  home: createFramedVariant(),
  about: createFramedVariant(),
  work: createFramedVariant(),
  contact: createFramedVariant(),
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const BASE_VIEWPORT_WIDTH = 1440;
const BASE_VIEWPORT_HEIGHT = 900;
const MIN_VIEWPORT_SCALE = 1;

const SHAPE_IDS: readonly ShapeId[] = [
  "torusSpringAzure",
  "waveSpringLime",
  "semiLimeFlamingo",
  "torusFlamingoLime",
  "semiFlamingoAzure",
  "sphereFlamingoSpring",
];

export const createResponsiveVariantState = (
  variant: VariantState,
  viewportWidth: number,
  viewportHeight: number,
): VariantState => {
  const widthScale = viewportWidth / BASE_VIEWPORT_WIDTH;
  const heightScale = viewportHeight / BASE_VIEWPORT_HEIGHT;
  const horizontalScale = clamp(widthScale, MIN_VIEWPORT_SCALE, 1);
  const verticalScale = clamp(heightScale, MIN_VIEWPORT_SCALE, 1);
  const depthScale = clamp(
    Math.min(widthScale, heightScale),
    MIN_VIEWPORT_SCALE,
    1,
  );

  const responsiveState = {} as VariantState;

  SHAPE_IDS.forEach((shapeId) => {
    const source = variant[shapeId];
    const [px, py, pz] = source.position;
    const [rx, ry, rz] = source.rotation;
    const scaledScale = Array.isArray(source.scale)
      ? ([
          source.scale[0] * depthScale,
          source.scale[1] * depthScale,
          source.scale[2] * depthScale,
        ] as Vector3Tuple)
      : source.scale * depthScale;

    responsiveState[shapeId] = {
      position: [
        px * horizontalScale,
        py * verticalScale,
        pz * depthScale,
      ] as Vector3Tuple,
      rotation: [rx, ry, rz] as Vector3Tuple,
      scale: scaledScale,
    };
  });

  return responsiveState;
};

export const createResponsiveHeroVariantState = (
  variant: VariantState,
  viewportWidth: number,
  viewportHeight: number,
  centerBelowWidth = 990,
  partiallyCenterBelowWidth = 1700,
): VariantState => {
  const responsiveVariant = createResponsiveVariantState(
    variant,
    viewportWidth,
    viewportHeight,
  );

  if (viewportWidth > partiallyCenterBelowWidth) {
    return responsiveVariant;
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  SHAPE_IDS.forEach((shapeId) => {
    const [x, y] = responsiveVariant[shapeId].position;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
    return responsiveVariant;
  }

  const offsetX = -((minX + maxX) / 2);
  const offsetY = -((minY + maxY) / 2);

  const applyFullCenter = viewportWidth <= centerBelowWidth;
  const horizontalFactor = applyFullCenter ? 1 : 0.5;
  const verticalFactor = applyFullCenter ? 1 : 0;

  SHAPE_IDS.forEach((shapeId) => {
    const transform = responsiveVariant[shapeId];
    const [x, y, z] = transform.position;
    transform.position = [
      x + offsetX * horizontalFactor,
      y + offsetY * verticalFactor,
      z,
    ] as Vector3Tuple;
  });

  return responsiveVariant;
};

export const LIGHT_THEME_PALETTE: GradientPalette = [
  ["#ffb3c2", "#ffc3cf", "#ffd4dc", "#ffe4ea"],
  ["#99b9ff", "#aec7ff", "#c3d6ff", "#d8e4ff"],
  ["#78ffd1", "#8effd8", "#a4ffdf", "#baffea"],
  ["#f0ffa6", "#f5ffba", "#f9ffcf", "#fdffe3"],
  ["#ffb3c2", "#f0ffa6", "#78ffd1", "#99b9ff"],
];

export const DARK_THEME_PALETTE: GradientPalette = [
  ["#2b2b33", "#2b2b33", "#2b2b33", "#2b2b33"],
  ["#25252d", "#25252d", "#25252d", "#25252d"],
  ["#303038", "#303038", "#303038", "#303038"],
  ["#27272f", "#27272f", "#27272f", "#27272f"],
  ["#2b2b33", "#2b2b33", "#2b2b33", "#2b2b33"],
];

export type ThemeName = "light" | "dark";

export const DEFAULT_BRIGHTNESS = 2.3;

export type ThreeAppState = {
  variantName: VariantName;
  variant: VariantState;
  hoverVariants: {
    desktop: VariantState;
    centered: VariantState;
  } | null;
  palette: GradientPalette;
  theme: ThemeName;
  parallax: boolean;
  hovered: boolean;
  cursorBoost: number;
  pointer: PointerTarget;
  pointerDriver: PointerDriver;
  manualPointer: PointerTarget;
  opacity: number;
  brightness: number;
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

const cloneScale = (scale: ShapeScale): ShapeScale =>
  Array.isArray(scale) ? ([...scale] as Vector3Tuple) : scale;

export const createVariantState = (variant: VariantState): VariantState => ({
  torusSpringAzure: {
    position: [...variant.torusSpringAzure.position] as Vector3Tuple,
    rotation: [...variant.torusSpringAzure.rotation] as Vector3Tuple,
    scale: cloneScale(variant.torusSpringAzure.scale),
  },
  waveSpringLime: {
    position: [...variant.waveSpringLime.position] as Vector3Tuple,
    rotation: [...variant.waveSpringLime.rotation] as Vector3Tuple,
    scale: cloneScale(variant.waveSpringLime.scale),
  },
  semiLimeFlamingo: {
    position: [...variant.semiLimeFlamingo.position] as Vector3Tuple,
    rotation: [...variant.semiLimeFlamingo.rotation] as Vector3Tuple,
    scale: cloneScale(variant.semiLimeFlamingo.scale),
  },
  torusFlamingoLime: {
    position: [...variant.torusFlamingoLime.position] as Vector3Tuple,
    rotation: [...variant.torusFlamingoLime.rotation] as Vector3Tuple,
    scale: cloneScale(variant.torusFlamingoLime.scale),
  },
  semiFlamingoAzure: {
    position: [...variant.semiFlamingoAzure.position] as Vector3Tuple,
    rotation: [...variant.semiFlamingoAzure.rotation] as Vector3Tuple,
    scale: cloneScale(variant.semiFlamingoAzure.scale),
  },
  sphereFlamingoSpring: {
    position: [...variant.sphereFlamingoSpring.position] as Vector3Tuple,
    rotation: [...variant.sphereFlamingoSpring.rotation] as Vector3Tuple,
    scale: cloneScale(variant.sphereFlamingoSpring.scale),
  },
});

export const getDefaultPalette = (theme: ThemeName): GradientPalette =>
  theme === "dark" ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE;