"use client";

import { useEffect } from "react";

const IGNORED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "LINK",
  "META",
  "TITLE",
  "TEMPLATE",
]);

const ROW_THRESHOLD_PX = 36;
const ROW_DELAY_SECONDS = 0.09;
const COLUMN_DELAY_SECONDS = 0.035;

type AnimatableElement = HTMLElement | SVGElement;

function isAnimatableElement(node: Element): node is AnimatableElement {
  return node instanceof HTMLElement || node instanceof SVGElement;
}

function collectAnimatableElements(root: ParentNode): AnimatableElement[] {
  const nodes = Array.from(root.querySelectorAll("*"));

  return nodes.filter((node) => {
    if (!isAnimatableElement(node)) {
      return false;
    }

    if (IGNORED_TAGS.has(node.tagName)) {
      return false;
    }

    if (node.closest("[data-global-fall-ignore='true']")) {
      return false;
    }

    if (node.classList.contains("word-fall")) {
      return false;
    }

    if (node.dataset.globalFallProcessed === "true") {
      return false;
    }

    const rect = node.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return false;
    }

    return true;
  }) as AnimatableElement[];
}

function applyAnimation(elements: AnimatableElement[]) {
  if (!elements.length) {
    return;
  }

  const sorted = elements
    .map((element, index) => ({
      element,
      index,
      rect: element.getBoundingClientRect(),
    }))
    .sort((a, b) => {
      const topDiff = a.rect.top - b.rect.top;
      if (Math.abs(topDiff) > ROW_THRESHOLD_PX) {
        return topDiff;
      }

      const leftDiff = a.rect.left - b.rect.left;
      if (leftDiff !== 0) {
        return leftDiff;
      }

      return a.index - b.index;
    });

  let currentRowTop = Number.NEGATIVE_INFINITY;
  let rowIndex = -1;
  let columnIndex = 0;

  sorted.forEach(({ element, rect }) => {
    if (rect.top - currentRowTop > ROW_THRESHOLD_PX) {
      rowIndex += 1;
      columnIndex = 0;
      currentRowTop = rect.top;
    }

    const delay = rowIndex * ROW_DELAY_SECONDS + columnIndex * COLUMN_DELAY_SECONDS;
    columnIndex += 1;

    element.dataset.globalFallProcessed = "true";
    element.style.setProperty("--global-fall-delay", `${delay}s`);
    element.classList.add("global-fall-element");
  });
}

export default function GlobalEntranceAnimation() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches) {
      return;
    }

    const { body } = document;
    if (!body) {
      return;
    }

    const apply = () => {
      const elements = collectAnimatableElements(body);
      applyAnimation(elements);
    };

    const raf = window.requestAnimationFrame(apply);

    return () => {
      window.cancelAnimationFrame(raf);
      const processed = body.querySelectorAll("[data-global-fall-processed='true']");
      processed.forEach((element) => {
        element.classList.remove("global-fall-element");
        (element as HTMLElement | SVGElement).style.removeProperty("--global-fall-delay");
        element.removeAttribute("data-global-fall-processed");
      });
    };
  }, []);

  return null;
}
