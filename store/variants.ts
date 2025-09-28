import { create } from 'zustand';

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

export const variantMapping: Record<'home' | 'about' | 'work' | 'contact', VariantState> = {
  home: {
    cTop: {
      position: [-1.5, 1.2, 0],
      rotation: [0, 0, Math.PI / 2],
    },
    cBottom: {
      position: [-1.5, -1.2, 0],
      rotation: [0, 0, -Math.PI / 2],
    },
    sShape: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    dot: {
      position: [2.4, 0, 0],
      rotation: [0, 0, 0],
    },
  },
  about: {
    // Spread the shapes evenly on a circle
    cTop: {
      position: [0, 2.0, 0],
      rotation: [0, 0, Math.PI],
    },
    cBottom: {
      position: [0, -2.0, 0],
      rotation: [0, 0, 0],
    },
    sShape: {
      position: [-2.0, 0, 0],
      rotation: [0, 0, -Math.PI / 4],
    },
    dot: {
      position: [2.0, 0, 0],
      rotation: [0, 0, 0],
    },
  },
  work: {
    // Compose the shapes into a diagonal composition
    cTop: {
      position: [-2.0, 1.5, 0],
      rotation: [0, 0, Math.PI / 3],
    },
    cBottom: {
      position: [-1.0, -1.5, 0],
      rotation: [0, 0, -Math.PI / 6],
    },
    sShape: {
      position: [1.2, 0.5, 0],
      rotation: [0, 0, Math.PI / 8],
    },
    dot: {
      position: [2.8, -0.8, 0],
      rotation: [0, 0, 0],
    },
  },
  contact: {
    // Stack everything in the centre for the contact page
    cTop: {
      position: [0, 1.5, 0],
      rotation: [0, 0, 0],
    },
    cBottom: {
      position: [0, -1.5, 0],
      rotation: [0, 0, 0],
    },
    sShape: {
      position: [0, 0, 0],
      rotation: [0, 0, Math.PI / 2],
    },
    dot: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
  },
};

interface VariantStore {
  variantName: 'home' | 'about' | 'work' | 'contact';
  variant: VariantState;
  setVariant: (name: 'home' | 'about' | 'work' | 'contact') => void;
}

export const useVariantStore = create<VariantStore>((set) => ({
  variantName: 'home',
  variant: variantMapping.home,
  setVariant: (name) =>
    set(() => ({ variantName: name, variant: variantMapping[name] })),
}));