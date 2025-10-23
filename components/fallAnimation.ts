import type { CSSProperties } from "react";

export const FALL_ITEM_TRANSITION_DURATION = 440;
export const FALL_ITEM_STAGGER_DELAY = 60;

const TRANSITION = [
  `transform ${FALL_ITEM_TRANSITION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`,
  `opacity ${FALL_ITEM_TRANSITION_DURATION}ms cubic-bezier(0.33, 1, 0.68, 1)`,
  `filter ${FALL_ITEM_TRANSITION_DURATION}ms ease`,
].join(", ");

const INACTIVE_TRANSFORM = "translate3d(0, -28px, 0) scale(0.94)";

export function getFallItemStyle(
  isActive: boolean,
  index: number,
  total: number,
  options?: { disable?: boolean },
): CSSProperties {
  if (options?.disable) {
    return {
      opacity: 1,
      transform: "none",
      transition: "none",
      filter: "none",
    };
  }

  const delay = isActive
    ? index * FALL_ITEM_STAGGER_DELAY
    : (total - 1 - index) * FALL_ITEM_STAGGER_DELAY;

  return {
    opacity: isActive ? 1 : 0,
    transform: isActive ? "translate3d(0, 0, 0) scale(1)" : INACTIVE_TRANSFORM,
    filter: isActive ? "blur(0px)" : "blur(10px)",
    transition: TRANSITION,
    transitionDelay: `${delay}ms`,
    willChange: "transform, opacity, filter",
  };
}
