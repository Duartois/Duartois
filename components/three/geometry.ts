import * as THREE from "three";

import type { ShapeId } from "./types";

/**
 * Geometry builders for the signature shapes.
 *
 * Every geometry is kept *indexed*: vertices are shared between neighbouring
 * triangles instead of being duplicated three times per face. That keeps the
 * silhouette and the smooth shading exactly as before while cutting vertex
 * count (and the memory/upload cost that comes with it) by roughly 6x. The
 * tessellation itself is picked per device tier — the shapes are smooth
 * tubes/spheres, so past a certain density extra triangles only cost memory.
 */

export type GeometryDetail = "high" | "medium" | "low";

export const THICKNESS = 0.64;
const TORUS_RADIUS = 1.28;
const FULL_ARC = (3 * Math.PI) / 2;

type DetailLevel = {
  /** Segments along a 270° arc (shorter arcs scale proportionally). */
  tubular: number;
  /** Segments around the tube cross-section (drives silhouette smoothness). */
  radial: number;
  /** Segments along the wave tube. */
  waveTubular: number;
  /** Rings in each hemispherical end cap. */
  capRings: number;
  sphereWidth: number;
  sphereHeight: number;
};

const DETAIL_LEVELS: Record<GeometryDetail, DetailLevel> = {
  high: {
    tubular: 128,
    radial: 72,
    waveTubular: 160,
    capRings: 18,
    sphereWidth: 72,
    sphereHeight: 48,
  },
  medium: {
    tubular: 96,
    radial: 56,
    waveTubular: 120,
    capRings: 14,
    sphereWidth: 60,
    sphereHeight: 40,
  },
  low: {
    tubular: 72,
    radial: 44,
    waveTubular: 90,
    capRings: 10,
    sphereWidth: 48,
    sphereHeight: 32,
  },
};

class CircularArcCurve extends THREE.Curve<THREE.Vector3> {
  public constructor(
    private readonly radius: number,
    private readonly arc: number,
    private readonly startAngle = -arc / 2,
  ) {
    super();
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const theta = this.startAngle + this.arc * t;
    const x = Math.cos(theta) * this.radius;
    const z = Math.sin(theta) * this.radius;
    target.set(x, 0, z);
    return target;
  }
}

class WaveCurve extends THREE.Curve<THREE.Vector3> {
  private readonly halfLength: number;

  public constructor(
    private readonly length: number,
    private readonly amplitude: number,
  ) {
    super();
    this.halfLength = length / 1.5;
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const x = THREE.MathUtils.lerp(-this.halfLength, this.halfLength, t);
    const waveT = (t - 0.5) * Math.PI * 2.5;
    const y = 0;
    const z = Math.sin(waveT) * this.amplitude;
    target.set(x, y, z);
    return target;
  }
}

/**
 * Concatenates indexed geometries into one, offsetting indices. Only the
 * attributes the shading actually uses (position + normal) are kept — the
 * materials have no textures, so UVs would just be dead weight on the GPU.
 */
const mergeIndexedGeometries = (
  geometries: THREE.BufferGeometry[],
): THREE.BufferGeometry => {
  let vertexTotal = 0;
  let indexTotal = 0;

  for (const geometry of geometries) {
    vertexTotal += geometry.getAttribute("position").count;
    indexTotal += geometry.getIndex()?.count ?? 0;
  }

  const positions = new Float32Array(vertexTotal * 3);
  const normals = new Float32Array(vertexTotal * 3);
  const indices =
    vertexTotal > 65535
      ? new Uint32Array(indexTotal)
      : new Uint16Array(indexTotal);

  let vertexOffset = 0;
  let indexOffset = 0;

  for (const geometry of geometries) {
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const index = geometry.getIndex();

    positions.set(position.array as ArrayLike<number>, vertexOffset * 3);
    normals.set(normal.array as ArrayLike<number>, vertexOffset * 3);

    if (index) {
      const source = index.array;
      for (let i = 0; i < source.length; i += 1) {
        indices[indexOffset + i] = source[i] + vertexOffset;
      }
      indexOffset += source.length;
    }

    vertexOffset += position.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));

  return merged;
};

const createRoundedTubeGeometry = (
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radialSegments: number,
  capRings: number,
) => {
  const tube = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    THICKNESS,
    radialSegments,
    false,
  );

  // Lower hemisphere; rotated below so it closes each end of the tube. Its
  // rim uses the same segment count as the tube cross-section.
  const hemiOrigin = new THREE.SphereGeometry(
    THICKNESS,
    radialSegments,
    capRings,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI / 2,
  );

  const startPoint = curve.getPoint(0);
  const endPoint = curve.getPoint(1);

  const tStart = curve.getTangent(0).normalize();
  const tEnd = curve.getTangent(1).normalize();

  const up = new THREE.Vector3(0, 1, 0);

  const qStart = new THREE.Quaternion().setFromUnitVectors(up, tStart);
  const qEnd = new THREE.Quaternion().setFromUnitVectors(
    up,
    tEnd.clone().multiplyScalar(-1),
  );

  const startCap = hemiOrigin.clone();
  startCap.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(qStart));
  startCap.translate(startPoint.x, startPoint.y, startPoint.z);

  const endCap = hemiOrigin.clone();
  endCap.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(qEnd));
  endCap.translate(endPoint.x, endPoint.y, endPoint.z);

  const merged = mergeIndexedGeometries([tube, startCap, endCap]);

  hemiOrigin.dispose();
  tube.dispose();
  startCap.dispose();
  endCap.dispose();

  return merged;
};

const createPartialTorusGeometry = (arc: number, level: DetailLevel) =>
  createRoundedTubeGeometry(
    new CircularArcCurve(TORUS_RADIUS, arc),
    Math.max(24, Math.round(level.tubular * (arc / FULL_ARC))),
    level.radial,
    level.capRings,
  );

const waveCurve = new WaveCurve(3.8, 0.4);

export const createShapeGeometry = (
  id: ShapeId,
  detail: GeometryDetail,
): THREE.BufferGeometry => {
  const level = DETAIL_LEVELS[detail];

  switch (id) {
    case "torusSpringAzure":
    case "torusFlamingoLime":
      return createPartialTorusGeometry(FULL_ARC, level);
    case "semiLimeFlamingo":
    case "semiFlamingoAzure":
      return createPartialTorusGeometry(Math.PI, level);
    case "waveSpringLime":
      return createRoundedTubeGeometry(
        waveCurve,
        level.waveTubular,
        level.radial,
        level.capRings,
      );
    case "sphereFlamingoSpring": {
      const sphere = new THREE.SphereGeometry(
        THICKNESS,
        level.sphereWidth,
        level.sphereHeight,
      );
      // No textures are used, so UVs would only add upload size.
      sphere.deleteAttribute("uv");
      return sphere;
    }
  }
};

/**
 * Gradient axis descriptors:
 * - "radial": distance from the origin in 3D space (sqrt(x^2 + y^2 + z^2)).
 * - "y": uses the Y component to drive the gradient.
 */
export type GradientAxis = "radial" | "y";

/**
 * Bakes a per-vertex colour gradient into the geometry. The gradient is a pure
 * function of the vertex position, so computing it on the shared (indexed)
 * vertices gives exactly the same colours the duplicated vertices used to get.
 */
export const applyGradientToGeometry = (
  geometry: THREE.BufferGeometry,
  stops: readonly string[],
  axis: GradientAxis,
): THREE.BufferGeometry => {
  const position = geometry.getAttribute("position");

  if (!position) {
    return geometry;
  }

  const count = position.count;
  const values = new Float32Array(count);
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < count; i += 1) {
    const value =
      axis === "y"
        ? position.getY(i)
        : Math.hypot(position.getX(i), position.getY(i), position.getZ(i));
    values[i] = value;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  const range = max - min || 1;
  const stopColors = stops.map((hex) => new THREE.Color(hex));
  const lastStop = stopColors.length - 1;
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const t = (values[i] - min) / range;
    const scaled = t * lastStop;
    const index = Math.floor(scaled);
    const nextIndex = Math.min(lastStop, index + 1);
    const localT = scaled - index;
    const from = stopColors[index];
    const to = stopColors[nextIndex];
    colors[i * 3] = from.r + (to.r - from.r) * localT;
    colors[i * 3 + 1] = from.g + (to.g - from.g) * localT;
    colors[i * 3 + 2] = from.b + (to.b - from.b) * localT;
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  // Garantimos limites atualizados para evitar que o Three.js oculte a malha ao
  // aplicar frustum culling com dados desatualizados.
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
};
