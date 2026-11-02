import { describe, expect, it } from "vitest";
import { Vector3 } from "three";

import {
  applyGradientToGeometry,
  createShapeGeometry,
  type GeometryDetail,
} from "./geometry";
import type { ShapeId } from "./types";

const SHAPE_IDS: ShapeId[] = [
  "torusSpringAzure",
  "waveSpringLime",
  "semiLimeFlamingo",
  "torusFlamingoLime",
  "semiFlamingoAzure",
  "sphereFlamingoSpring",
];

const DETAILS: GeometryDetail[] = ["high", "medium", "low"];

const triangleCount = (id: ShapeId, detail: GeometryDetail) => {
  const geometry = createShapeGeometry(id, detail);
  const count = (geometry.getIndex()?.count ?? 0) / 3;
  geometry.dispose();
  return count;
};

describe("createShapeGeometry", () => {
  it.each(DETAILS)("builds indexed geometry for every shape (%s)", (detail) => {
    for (const id of SHAPE_IDS) {
      const geometry = createShapeGeometry(id, detail);
      const index = geometry.getIndex();
      const position = geometry.getAttribute("position");

      expect(index).not.toBeNull();
      expect(position.count).toBeGreaterThan(0);
      // Indexed means vertices are shared, not tripled per face.
      expect(position.count).toBeLessThan(index!.count);
      expect(Math.max(...Array.from(index!.array))).toBeLessThan(
        position.count,
      );
      expect(geometry.getAttribute("normal").count).toBe(position.count);
      expect(geometry.getAttribute("uv")).toBeUndefined();

      geometry.dispose();
    }
  });

  it("keeps the overall silhouette the same across detail tiers", () => {
    for (const id of SHAPE_IDS) {
      const high = createShapeGeometry(id, "high");
      const low = createShapeGeometry(id, "low");
      high.computeBoundingBox();
      low.computeBoundingBox();

      const highSize = high.boundingBox!.getSize(new Vector3());
      const lowSize = low.boundingBox!.getSize(new Vector3());

      expect(lowSize.x).toBeCloseTo(highSize.x, 1);
      expect(lowSize.y).toBeCloseTo(highSize.y, 1);
      expect(lowSize.z).toBeCloseTo(highSize.z, 1);

      high.dispose();
      low.dispose();
    }
  });

  it("uses fewer triangles on lower tiers", () => {
    for (const id of SHAPE_IDS) {
      const high = triangleCount(id, "high");
      const medium = triangleCount(id, "medium");
      const low = triangleCount(id, "low");

      expect(high).toBeGreaterThan(medium);
      expect(medium).toBeGreaterThan(low);
    }
  });

  it("stays well under the old ~370k triangle budget", () => {
    const total = (detail: GeometryDetail) =>
      SHAPE_IDS.reduce((sum, id) => sum + triangleCount(id, detail), 0);

    expect(total("high")).toBeLessThan(150_000);
    expect(total("low")).toBeLessThan(60_000);
  });
});

describe("applyGradientToGeometry", () => {
  it("bakes a colour per shared vertex within the stop range", () => {
    const geometry = applyGradientToGeometry(
      createShapeGeometry("sphereFlamingoSpring", "low"),
      ["#ff9fd3", "#c9c5be", "#a8e1c2", "#91faca"],
      "y",
    );
    const color = geometry.getAttribute("color");

    expect(color.count).toBe(geometry.getAttribute("position").count);
    expect(color.itemSize).toBe(3);
    for (const value of Array.from(color.array)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
    expect(geometry.boundingSphere).not.toBeNull();

    geometry.dispose();
  });
});
