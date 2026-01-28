import type * as THREE from "three";
import type { PointerDriver } from "./types";

export const getPointerTargetVector = (
  driver: PointerDriver,
  manualTarget: THREE.Vector2,
  deviceTarget: THREE.Vector2,
) => (driver === "manual" ? manualTarget : deviceTarget);
