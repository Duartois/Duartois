/**
 * Frame-rate independent motion helpers for the 3D scene.
 *
 * Shapes follow a critically damped spring instead of a per-frame lerp. The
 * step below is the closed-form solution, so it lands in the same place for any
 * `dt` (a slow frame during a route change just takes a bigger step) and it
 * keeps its velocity when the target changes mid-flight. That is what lets the
 * background glide from one page layout to the next — across the page swap —
 * without restarting, snapping or changing speed abruptly.
 */

/** Solves (1 + x)·e^-x = 0.02 — the point where a critically damped spring is 98% done. */
const SETTLE_98 = 5.8335;

/** Spring stiffness (ω, 1/s) that reaches ~98% of the way in `ms`. */
export const omegaForSettleMs = (ms: number): number =>
  SETTLE_98 / (Math.max(ms, 1) / 1000);

/**
 * Advances one component of a critically damped spring.
 *
 * @param x        current value
 * @param target   value to settle on
 * @param velocity per-component velocity store (updated in place at `index`)
 * @param index    slot of this component in `velocity`
 * @param omega    stiffness, see {@link omegaForSettleMs}
 * @param dt       elapsed seconds
 * @returns the new value
 */
export const dampStep = (
  x: number,
  target: number,
  velocity: Float64Array,
  index: number,
  omega: number,
  dt: number,
): number => {
  const decay = Math.exp(-omega * dt);
  const offset = x - target;
  const carry = (velocity[index] + omega * offset) * dt;
  velocity[index] = (velocity[index] - omega * carry) * decay;
  return target + (offset + carry) * decay;
};

/** First-order approach used for opacity/blur, which don't need momentum. */
export const easeToward = (
  value: number,
  target: number,
  rate: number,
  dt: number,
): number => target + (value - target) * Math.exp(-rate * dt);
