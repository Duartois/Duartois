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

declare module "three/examples/jsm/loaders/SVGLoader.js" {
  import * as THREE from "three";

  export interface SVGPath {
    id?: string;
    userData?: { node?: { id?: string } };
    toShapes: (isCCW: boolean) => THREE.Shape[];
  }

  export interface SVGResult {
    paths: SVGPath[];
  }

  export class SVGLoader extends THREE.Loader {
    constructor();
    load(
      url: string,
      onLoad: (data: SVGResult) => void,
      onProgress?: (event: ProgressEvent<EventTarget>) => void,
      onError?: (event: ErrorEvent) => void,
    ): void;
    parse(data: string): SVGResult;
  }
}
