import { create } from "zustand";

export type VariantName = "home" | "about" | "work" | "contact" | "avatar";

export type ShapeTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
};

/** A collection of transformations for all shapes in the scene. */
export type VariantState = {
  torus270A: ShapeTransform;
  torus270B: ShapeTransform;
  semi180A: ShapeTransform;
  semi180B: ShapeTransform;
  wave: ShapeTransform;
  sphere: ShapeTransform;
};

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

interface VariantStore {
  variantName: VariantName;
  variant: VariantState;
  setVariant: (name: VariantName) => void;
}

export const useVariantStore = create<VariantStore>((set) => ({
  variantName: "home",
  variant: variantMapping.home,
  setVariant: (name) =>
    set(() => ({ variantName: name, variant: variantMapping[name] })),
}));
