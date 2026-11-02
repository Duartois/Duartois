import { describe, expect, it } from "vitest";

import { dampStep, easeToward, omegaForSettleMs } from "./motion";

const simulate = (
  from: number,
  target: number,
  omega: number,
  seconds: number,
  dt: number,
  velocity = new Float64Array(1),
) => {
  let x = from;
  for (let t = 0; t < seconds - 1e-9; t += dt) {
    x = dampStep(x, target, velocity, 0, omega, dt);
  }
  return { x, velocity: velocity[0] };
};

describe("dampStep", () => {
  it("lands in the same place regardless of frame rate", () => {
    const omega = omegaForSettleMs(800);
    const at60 = simulate(0, 10, omega, 0.6, 1 / 60).x;
    const at20 = simulate(0, 10, omega, 0.6, 1 / 20).x;
    const at5 = simulate(0, 10, omega, 0.6, 1 / 5).x;

    expect(at20).toBeCloseTo(at60, 6);
    expect(at5).toBeCloseTo(at60, 6);
  });

  it("is ~98% of the way there after the settle time", () => {
    const { x } = simulate(0, 1, omegaForSettleMs(820), 0.82, 1 / 60);

    expect(x).toBeGreaterThan(0.975);
    expect(x).toBeLessThan(0.985);
  });

  it("never overshoots the target", () => {
    const omega = omegaForSettleMs(600);
    const velocity = new Float64Array(1);
    let x = 0;

    for (let frame = 0; frame < 240; frame += 1) {
      x = dampStep(x, 1, velocity, 0, omega, 1 / 60);
      expect(x).toBeLessThanOrEqual(1 + 1e-9);
    }
    expect(x).toBeCloseTo(1, 4);
  });

  it("keeps its momentum when the target changes mid-flight", () => {
    const omega = omegaForSettleMs(800);
    const velocity = new Float64Array(1);
    let x = 0;

    for (let frame = 0; frame < 20; frame += 1) {
      x = dampStep(x, 10, velocity, 0, omega, 1 / 60);
    }
    const velocityBefore = velocity[0];
    const next = dampStep(x, 4, velocity, 0, omega, 1 / 60);

    // No restart: the shape keeps moving the way it was going instead of
    // stopping dead or jumping, so the step stays smooth.
    expect(velocityBefore).toBeGreaterThan(0);
    expect(Math.abs(next - x)).toBeLessThan(0.5);
  });

  it("stays put when it is already on target", () => {
    const velocity = new Float64Array(1);
    expect(dampStep(3, 3, velocity, 0, 8, 1 / 60)).toBe(3);
    expect(velocity[0]).toBe(0);
  });
});

describe("easeToward", () => {
  it("approaches the target without crossing it", () => {
    let value = 0;
    for (let frame = 0; frame < 120; frame += 1) {
      value = easeToward(value, 1, 10, 1 / 60);
      expect(value).toBeLessThanOrEqual(1);
    }
    expect(value).toBeGreaterThan(0.99);
  });
});
