import { create } from "zustand";

export type VariantName = "home" | "about" | "work" | "contact";

export type ShapeTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
};

/** A collection of transformations for all shapes in the scene. */
export type VariantState = {
  cTop: ShapeTransform;
  cBottom: ShapeTransform;
  sShape: ShapeTransform;
  dot: ShapeTransform;
};

export const variantMapping: Record<VariantName, VariantState> = {
  home: {
    cTop: {
      position: [-1.8, 1.35, 0.1],
      rotation: [0.32, -0.1, 1.28],
    },
    cBottom: {
      position: [-1.6, -1.25, -0.05],
      rotation: [-0.36, 0.12, -1.22],
    },
    sShape: {
      position: [0.6, 0.25, 0],
      rotation: [0.1, 0.35, -0.28],
    },
    dot: {
      position: [2.35, -0.2, 0.08],
      rotation: [0.22, -0.12, 0.58],
    },
  },
  about: {
    cTop: {
      position: [1.5, 1.65, 0.18],
      rotation: [0.28, 0.06, 2.35],
    },
    cBottom: {
      position: [-1.75, -1.4, -0.12],
      rotation: [-0.34, -0.1, -2.18],
    },
    sShape: {
      position: [-2.15, 0.75, 0.04],
      rotation: [0.12, 0.28, 0.95],
    },
    dot: {
      position: [1.9, -1.85, 0.12],
      rotation: [0.18, 0.16, 0.38],
    },
  },
  work: {
    cTop: {
      position: [-2.35, 1.85, 0.16],
      rotation: [0.36, -0.22, 1.62],
    },
    cBottom: {
      position: [-0.85, -1.85, -0.08],
      rotation: [-0.42, 0.18, -1.28],
    },
    sShape: {
      position: [1.55, 0.95, 0.02],
      rotation: [0.22, -0.38, 0.22],
    },
    dot: {
      position: [2.95, -0.95, 0.1],
      rotation: [0.34, 0.14, 0.28],
    },
  },
  contact: {
    cTop: {
      position: [0, 1.55, 0.1],
      rotation: [0.16, 0.05, 0.08],
    },
    cBottom: {
      position: [0, -1.55, -0.05],
      rotation: [-0.18, -0.05, -0.12],
    },
    sShape: {
      position: [0, 0, 0],
      rotation: [0.18, 0.32, 1.48],
    },
    dot: {
      position: [0.2, -0.1, 0.04],
      rotation: [0.1, 0.08, 0.16],
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
