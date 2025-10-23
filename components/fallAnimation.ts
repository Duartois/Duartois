import type { CSSProperties } from "react";

export const FALL_ITEM_TRANSITION_DURATION = 440;
export const FALL_ITEM_STAGGER_DELAY = 60;

const TRANSITION = `transform ${FALL_ITEM_TRANSITION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;

const INACTIVE_TRANSFORM = "translate3d(0, -28px, 0)";

export function getFallItemStyle(
  isActive: boolean,
  index: number,
  total: number,
  options?: { disable?: boolean },
): CSSProperties {
  if (options?.disable) {
    return {
      transform: "none",
      transition: "none",
      filter: "none",
    };
  }

  const delay = isActive
    ? index * FALL_ITEM_STAGGER_DELAY
    : (total - 1 - index) * FALL_ITEM_STAGGER_DELAY;

  return {
    transform: isActive ? "translate3d(0, 0, 0)" : INACTIVE_TRANSFORM,
    transition: TRANSITION,
    transitionDelay: `${delay}ms`,
    willChange: "transform",
  };
}
