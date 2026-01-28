"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ThreeAppHandle } from "@/components/three/types";
import { setThreeAppInstance } from "./threeAppStore";

type ThreeAppContextValue = {
  app: ThreeAppHandle | null;
  setApp: (next: ThreeAppHandle | null) => void;
  isSceneActive: boolean;
  setSceneActive: (active: boolean) => void;
};

const ThreeAppContext = createContext<ThreeAppContextValue | undefined>(undefined);

export function ThreeAppProvider({ children }: { children: ReactNode }) {
  const [app, setAppState] = useState<ThreeAppHandle | null>(null);
  const [isSceneActive, setSceneActive] = useState(false);

  const setApp = useCallback((next: ThreeAppHandle | null) => {
    setAppState(next);
    setThreeAppInstance(next);
  }, []);

  const value = useMemo(
    () => ({
      app,
      setApp,
      isSceneActive,
      setSceneActive,
    }),
    [app, setApp, isSceneActive],
  );

  return (
    <ThreeAppContext.Provider value={value}>
      {children}
    </ThreeAppContext.Provider>
  );
}

export function useThreeApp() {
  const context = useContext(ThreeAppContext);
  if (!context) {
    throw new Error("useThreeApp must be used within a ThreeAppProvider");
  }
  return context;
}
