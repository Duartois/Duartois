"use client";

import type { ThreeAppHandle } from "@/components/three/types";

type ThreeAppListener = (app: ThreeAppHandle | null) => void;

let currentApp: ThreeAppHandle | null = null;
const listeners = new Set<ThreeAppListener>();

export const setThreeAppInstance = (app: ThreeAppHandle | null) => {
  currentApp = app;
  listeners.forEach((listener) => listener(app));
};

export const getThreeAppInstance = () => currentApp;

export const subscribeThreeApp = (listener: ThreeAppListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
