import type { CSSProperties } from "react";

export const FALL_ITEM_TRANSITION_DURATION = 520;
export const FALL_ITEM_STAGGER_DELAY = 80;
export const WORK_ITEM_TRANSITION_DURATION = 720;
export const WORK_ITEM_STAGGER_DELAY = 100;

const DEFAULT_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const TRANSITION = `transform ${FALL_ITEM_TRANSITION_DURATION}ms ${DEFAULT_EASE}, opacity ${FALL_ITEM_TRANSITION_DURATION}ms ${DEFAULT_EASE}`;
const WORK_TRANSITION = `transform ${WORK_ITEM_TRANSITION_DURATION}ms ${DEFAULT_EASE}, opacity ${WORK_ITEM_TRANSITION_DURATION}ms ${DEFAULT_EASE}, filter ${WORK_ITEM_TRANSITION_DURATION}ms ${DEFAULT_EASE}`;

const ACTIVE_TRANSFORM = "translate3d(0, 0, 0) scale(1)";
const WORK_INACTIVE_TRANSFORM = "translate3d(0, -60px, 0) scale(0.98)";
const DEFAULT_INACTIVE_TRANSFORM = "translate3d(0, -100px, 0)";

export const getFallSequenceDuration = (
  totalItems: number,
  variant: "default" | "work" = "default",
) => {
  const safeTotal = Math.max(totalItems, 1);
  const duration =
    variant === "work"
      ? WORK_ITEM_TRANSITION_DURATION
      : FALL_ITEM_TRANSITION_DURATION;
  const stagger =
    variant === "work" ? WORK_ITEM_STAGGER_DELAY : FALL_ITEM_STAGGER_DELAY;

  return duration + (safeTotal - 1) * stagger;
};

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
      ? ACTIVE_TRANSFORM
      : isWorkVariant
        ? WORK_INACTIVE_TRANSFORM
        : DEFAULT_INACTIVE_TRANSFORM,
    filter: isWorkVariant ? (isActive ? "blur(0px)" : "blur(6px)") : "none",
    transition: isWorkVariant
      ? WORK_TRANSITION
      : TRANSITION,
    transitionDelay: `${delay}ms`,
    willChange: isWorkVariant ? "transform, opacity, filter" : "transform",
  };
}
