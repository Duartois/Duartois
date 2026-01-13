import type { CSSProperties } from "react";

export const FALL_ITEM_TRANSITION_DURATION = 520;
export const FALL_ITEM_STAGGER_DELAY = 80;

const TRANSITION = `transform ${FALL_ITEM_TRANSITION_DURATION}ms cubic-bezier(.25,.46,.45,.94), opacity ${FALL_ITEM_TRANSITION_DURATION}ms cubic-bezier(.25,.46,.45,.94)`;

const INACTIVE_TRANSFORM = "translate3d(0, -28px, 0)";

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
    transform: isActive
      ? "translateY(0px) translateZ(0px)"
      : "translateY(-100px) translateZ(0px)",
    transition: TRANSITION,
    transitionDelay: `${delay}ms`,
    willChange: "transform",
  };
}
