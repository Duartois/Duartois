"use client";

import { RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { useAnimationQuality } from "@/components/AnimationQualityContext";

interface Options {
  distance?: number;
  duration?: number;
  delayStep?: number;
}

const DEFAULT_DISTANCE = 100;
const DEFAULT_DURATION = 600;
const DEFAULT_DELAY_STEP = 50;

type AnimationState = "enter" | "exit";

const getReduceMotionPreference = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const orderElements = (elements: HTMLElement[]) => {
  return elements
    .map((element) => ({
      element,
      rect: element.getBoundingClientRect(),
    }))
    .sort((a, b) => {
      const rowDiff = a.rect.top - b.rect.top;

      if (Math.abs(rowDiff) > 16) {
        return rowDiff;
      }

      return a.rect.left - b.rect.left;
    })
    .map(({ element }) => element);
};

const resetElementStyles = (element: HTMLElement) => {
  element.style.removeProperty("transition-property");
  element.style.removeProperty("transition-duration");
  element.style.removeProperty("transition-delay");
  element.style.removeProperty("transition-timing-function");
  element.style.removeProperty("opacity");
  element.style.removeProperty("transform");
  element.style.removeProperty("will-change");
};

const applyAnimationState = (
  elements: HTMLElement[],
  state: AnimationState,
  immediate: boolean,
  reduceMotion: boolean,
  options?: Options,
) => {
  if (!elements.length) {
    return;
  }

  const distance = options?.distance ?? DEFAULT_DISTANCE;
  const duration = options?.duration ?? DEFAULT_DURATION;
  const delayStep = options?.delayStep ?? DEFAULT_DELAY_STEP;
  const total = elements.length;

  elements.forEach((element, index) => {
    if (reduceMotion) {
      element.style.transitionProperty = "none";
      element.style.transitionDuration = "0ms";
      element.style.transitionDelay = "0ms";
      element.style.removeProperty("transition-timing-function");
      element.style.removeProperty("will-change");
    } else {
      const delayIndex = state === "enter" ? index : total - 1 - index;

      element.style.transitionProperty = "transform, opacity";
      element.style.transitionTimingFunction =
        "cubic-bezier(0.22, 0.61, 0.36, 1)";
      element.style.transitionDuration = immediate
        ? "0ms"
        : `${duration}ms`;
      element.style.transitionDelay = immediate
        ? "0ms"
        : `${delayIndex * delayStep}ms`;
      element.style.willChange = "transform, opacity";
    }

    element.style.opacity = state === "enter" ? "1" : "0";
    element.style.transform =
      state === "enter" ? "none" : `translateY(-${distance}px)`;
  });
};

export default function useSequentialReveal(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  options?: Options,
) {
  const elementsRef = useRef<HTMLElement[]>([]);
  const hasSetupRef = useRef(false);
  const { resolvedQuality } = useAnimationQuality();
  const reduceMotion =
    resolvedQuality === "low" || getReduceMotionPreference();

  const distance = options?.distance;
  const duration = options?.duration;
  const delayStep = options?.delayStep;

  useLayoutEffect(() => {
    const root = ref.current;

    if (!root) {
      return;
    }

    const descendants = Array.from(root.querySelectorAll("*"));
    const candidates = [root, ...descendants].filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );

    const ordered = orderElements(candidates);
    elementsRef.current = ordered;
    hasSetupRef.current = true;

    applyAnimationState(ordered, "exit", true, reduceMotion, options);

    return () => {
      ordered.forEach(resetElementStyles);
      elementsRef.current = [];
      hasSetupRef.current = false;
    };
  }, [ref, distance, duration, delayStep, reduceMotion]);

  useEffect(() => {
    if (!hasSetupRef.current) {
      return;
    }

    const elements = elementsRef.current;

    if (!elements.length) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      applyAnimationState(
        elements,
        active ? "enter" : "exit",
        false,
        reduceMotion,
        options,
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [active, distance, duration, delayStep, reduceMotion]);
}
