import * as THREE from "three";

declare module "three/examples/jsm/objects/MarchingCubes.js" {
  export class MarchingCubes extends THREE.ImmediateRenderObject {
    constructor(
      resolution: number,
      material: THREE.Material,
      enableUvs: boolean,
      enableColors: boolean,
      useNormals?: boolean,
      useUvs?: boolean,
    );
    field: Float32Array;
    enableUvs: boolean;
    enableColors: boolean;
    subtract: number;
    strength: number;
    addBall(
      x: number,
      y: number,
      z: number,
      strength: number,
      subtract: number,
      color?: THREE.Color,
    ): void;
    addPlane(x: number, y: number, z: number, strength: number, subtract: number): void;
    reset(): void;
    update(): void;
  }
}
