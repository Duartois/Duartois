import type { CSSProperties } from "react";

export const FALL_ITEM_TRANSITION_DURATION = 520;
export const FALL_ITEM_STAGGER_DELAY = 80;
const WORK_ITEM_TRANSITION_DURATION = 720;
const WORK_ITEM_STAGGER_DELAY = 100;

const TRANSITION = `transform ${FALL_ITEM_TRANSITION_DURATION}ms cubic-bezier(.25,.46,.45,.94), opacity ${FALL_ITEM_TRANSITION_DURATION}ms cubic-bezier(.25,.46,.45,.94)`;
const WORK_TRANSITION = `transform ${WORK_ITEM_TRANSITION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${WORK_ITEM_TRANSITION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), filter ${WORK_ITEM_TRANSITION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;

const WORK_INACTIVE_TRANSFORM = "translateY(-60px) translateZ(0px) scale(0.98)";

export function getFallItemStyle(
  isActive: boolean,
  index: number,
  total: number,
  options?: { disable?: boolean; variant?: "default" | "work" },
): CSSProperties {
  if (options?.disable) {
    return {
      opacity: 1,
      transform: "none",
      transition: "none",
      filter: "none",
    };
  }

  const isWorkVariant = options?.variant === "work";
  const duration = isWorkVariant
    ? WORK_ITEM_TRANSITION_DURATION
    : FALL_ITEM_TRANSITION_DURATION;
  const stagger = isWorkVariant ? WORK_ITEM_STAGGER_DELAY : FALL_ITEM_STAGGER_DELAY;
  const delay = isActive ? index * stagger : (total - 1 - index) * stagger;

  return {
    opacity: isActive ? 1 : 0,
    transform: isActive
      ? "translateY(0px) translateZ(0px) scale(1)"
      : isWorkVariant
        ? WORK_INACTIVE_TRANSFORM
        : "translateY(-100px) translateZ(0px)",
    filter: isWorkVariant ? (isActive ? "blur(0px)" : "blur(6px)") : "none",
    transition: isWorkVariant
      ? WORK_TRANSITION
      : TRANSITION,
    transitionDelay: `${delay}ms`,
    willChange: isWorkVariant ? "transform, opacity, filter" : "transform",
  };
}
