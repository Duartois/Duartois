"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const ITEM_TRANSITION_DURATION = 400;
const ITEM_STAGGER_DELAY = 60;
const MAX_STAGGER_STEPS = 12;
const REVEAL_EVENT = "app-shell:reveal";

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
  const revealListenerRef = useRef<(() => void) | null>(null);
  const enterFramesRef = useRef<number[]>([]);

  useEffect(() => {
    if (cleanupTimerRef.current) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = undefined;
    }

    if (revealListenerRef.current) {
      window.removeEventListener(REVEAL_EVENT, revealListenerRef.current);
      revealListenerRef.current = null;
    }

    enterFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
    enterFramesRef.current.length = 0;

    const body = document.body;
    const elements = Array.from(
      body.querySelectorAll<HTMLElement | SVGElement>("*:not(html):not(body)")
    ).filter((el) => !isSkippable(el) && !el.closest("[data-fall-skip='true']"));

    const preloading = body.dataset.preloading === "true";
    const waitingElements: (HTMLElement | SVGElement)[] = [];
    const immediateElements: (HTMLElement | SVGElement)[] = [];

    elements.forEach((el, index) => {
      setDelay(el, computeDelay(index));
      el.classList.add("fall-animated");
      el.classList.remove("fall-enter");
      el.classList.remove("fall-exit");

      if (
        preloading &&
        !el.closest("[data-preloader-root='true']") &&
        !el.hasAttribute("data-preloader-root")
      ) {
        waitingElements.push(el);
      } else {
        immediateElements.push(el);
      }
    });

    const addEnterClass = (targets: (HTMLElement | SVGElement)[]) => {
      if (!targets.length) {
        return;
      }

      const first = window.requestAnimationFrame(() => {
        const second = window.requestAnimationFrame(() => {
          targets.forEach((el) => {
            el.classList.add("fall-enter");
          });
        });
        enterFramesRef.current.push(second);
      });

      enterFramesRef.current.push(first);
    };

    addEnterClass(immediateElements);

    if (waitingElements.length) {
      const reveal = () => {
        addEnterClass(waitingElements);
        revealListenerRef.current = null;
      };

      if (body.dataset.preloading === "true") {
        revealListenerRef.current = reveal;
        window.addEventListener(REVEAL_EVENT, reveal, { once: true });
      } else {
        reveal();
      }
    }

    return () => {
      if (revealListenerRef.current) {
        window.removeEventListener(REVEAL_EVENT, revealListenerRef.current);
        revealListenerRef.current = null;
      }

      enterFramesRef.current.forEach((frame) =>
        window.cancelAnimationFrame(frame),
      );
      enterFramesRef.current.length = 0;
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
