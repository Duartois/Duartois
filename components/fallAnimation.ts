import type { CSSProperties } from "react";
import {
  FALL_ITEM_STAGGER_DELAY,
  FALL_ITEM_TRANSITION_DURATION,
  FALL_TRANSITION,
  WORK_ITEM_STAGGER_DELAY,
  WORK_ITEM_TRANSITION_DURATION,
  WORK_TRANSITION,
} from "./animation/fallConstants";

const ACTIVE_TRANSFORM = "translate3d(0, 0, 0) scale(1)";
const WORK_INACTIVE_TRANSFORM = "translate3d(0, -60px, 0) scale(0.98)";
const DEFAULT_INACTIVE_TRANSFORM = "translate3d(0, -100px, 0)";

export const getFallExitDuration = (
  totalItems: number,
  variant: "default" | "work" = "default",
) => {
  const duration =
    variant === "work"
      ? WORK_ITEM_TRANSITION_DURATION
      : FALL_ITEM_TRANSITION_DURATION;
  const stagger = variant === "work" ? WORK_ITEM_STAGGER_DELAY : FALL_ITEM_STAGGER_DELAY;
  return duration + Math.max(totalItems - 1, 0) * stagger;
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
    transition: isWorkVariant ? WORK_TRANSITION : FALL_TRANSITION,
    transitionDelay: `${delay}ms`,
    willChange: isWorkVariant ? "transform, opacity, filter" : "transform",
  };
}
