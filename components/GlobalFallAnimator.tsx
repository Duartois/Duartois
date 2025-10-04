"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const ITEM_TRANSITION_DURATION = 400;
const ITEM_STAGGER_DELAY = 60;
const MAX_STAGGER_STEPS = 12;

function isSkippable(el: Element) {
  const tag = el.tagName;
  return (
    tag === "SCRIPT" ||
    tag === "STYLE" ||
    tag === "LINK" ||
    tag === "META" ||
    tag === "TITLE" ||
    tag === "NOSCRIPT"
  );
}

function computeDelay(index: number) {
  return Math.min(index, MAX_STAGGER_STEPS) * ITEM_STAGGER_DELAY;
}

function setDelay(el: HTMLElement | SVGElement, delay: number) {
  if ("style" in el && el.style) {
    el.style.setProperty("--fall-delay", `${delay}ms`);
  }
}

export default function GlobalFallAnimator() {
  const pathname = usePathname();
  const cleanupTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (cleanupTimerRef.current) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = undefined;
    }

    const body = document.body;
    const elements = Array.from(
      body.querySelectorAll<HTMLElement | SVGElement>("*:not(html):not(body)")
    ).filter((el) => !isSkippable(el) && !el.closest("[data-fall-skip='true']"));

    elements.forEach((el, index) => {
      setDelay(el, computeDelay(index));
      el.classList.add("fall-animated");
      el.classList.remove("fall-exit");
    });

    const enterFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        elements.forEach((el) => {
          el.classList.add("fall-enter");
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(enterFrame);
      const total = elements.length;

      elements.forEach((el, index) => {
        const delay = computeDelay(total - 1 - index);
        setDelay(el, delay);
        el.classList.remove("fall-enter");
        el.classList.add("fall-exit");
      });

      cleanupTimerRef.current = window.setTimeout(() => {
        elements.forEach((el) => {
          el.classList.remove("fall-animated", "fall-exit");
          if ("style" in el && el.style) {
            el.style.removeProperty("--fall-delay");
          }
        });
        cleanupTimerRef.current = undefined;
      }, ITEM_TRANSITION_DURATION + Math.max(total - 1, 0) * ITEM_STAGGER_DELAY);
    };
  }, [pathname]);

  return null;
}
