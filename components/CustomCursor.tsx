"use client";

import { useEffect, useRef, useState } from "react";

function applyTransform(element: HTMLDivElement, x: number, y: number) {
  const offsetX = x - window.innerWidth / 2;
  const offsetY = y - window.innerHeight / 2;
  element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) translate(-50%, -50%)`;
}

export default function CustomCursor() {
  const [isDesktopPointer, setIsDesktopPointer] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const desktopWidthQuery = window.matchMedia("(min-width: 64em)");

    const updatePointerState = () => {
      setIsDesktopPointer(
        finePointerQuery.matches && desktopWidthQuery.matches,
      );
    };

    updatePointerState();

    finePointerQuery.addEventListener("change", updatePointerState);
    desktopWidthQuery.addEventListener("change", updatePointerState);

    return () => {
      finePointerQuery.removeEventListener("change", updatePointerState);
      desktopWidthQuery.removeEventListener("change", updatePointerState);
    };
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const cursor = cursorRef.current;

    if (!dot || !cursor || !isDesktopPointer) {
      document.body.classList.remove("cursor-enabled");
      return;
    }

    document.body.classList.add("cursor-enabled");

    let raf = 0;
    let animationActive = false;
    const targetPosition = { x: 0, y: 0 };
    const dotPosition = { x: 0, y: 0 };
    const cursorPosition = { x: 0, y: 0 };
    const cursorStyle = window.getComputedStyle(cursor);
    const baseCursorSize = parseFloat(cursorStyle.width) || 24;
    let currentScale = 1;
    let targetScale = 1;
    let renderedScale = 1;
    let hoveredInteractive: HTMLElement | null = null;
    let isMouseDown = false;

    const DOT_EASE = 0.22;
    const CURSOR_EASE = 0.12;
    const SCALE_EASE = 0.18;

    const show = () => {
      dot.style.opacity = "1";
      cursor.style.opacity = "1";
      startAnimation();
    };

    const hide = () => {
      dot.style.opacity = "0";
      cursor.style.opacity = "0";
    };

    const applyScaleTarget = () => {
      targetScale = isMouseDown || hoveredInteractive ? 2 : 1;
      startAnimation();
    };

    const startAnimation = () => {
      if (animationActive) {
        return;
      }

      animationActive = true;
      raf = requestAnimationFrame(tick);
    };

    const stopAnimation = () => {
      animationActive = false;
      cancelAnimationFrame(raf);
    };

    const tick = () => {
      dotPosition.x += (targetPosition.x - dotPosition.x) * DOT_EASE;
      dotPosition.y += (targetPosition.y - dotPosition.y) * DOT_EASE;
      cursorPosition.x += (targetPosition.x - cursorPosition.x) * CURSOR_EASE;
      cursorPosition.y += (targetPosition.y - cursorPosition.y) * CURSOR_EASE;

      const scaleDelta = targetScale - currentScale;
      if (Math.abs(scaleDelta) > 0.01) {
        currentScale += scaleDelta * SCALE_EASE;
      } else {
        currentScale = targetScale;
      }

      applyTransform(dot, dotPosition.x, dotPosition.y);
      applyTransform(cursor, cursorPosition.x, cursorPosition.y);

      if (Math.abs(currentScale - renderedScale) > 0.001) {
        renderedScale = currentScale;
        const size = baseCursorSize * currentScale;
        const sizeValue = `${size.toFixed(2)}px`;
        cursor.style.width = sizeValue;
        cursor.style.height = sizeValue;
      }

      if (animationActive) {
        raf = requestAnimationFrame(tick);
      }
    };

    const updatePosition = (x: number, y: number) => {
      targetPosition.x = x;
      targetPosition.y = y;
      startAnimation();
    };

    const handleMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
      show();
    };

    const handleDown = () => {
      isMouseDown = true;
      applyScaleTarget();
    };

    const handleUp = () => {
      isMouseDown = false;
      applyScaleTarget();
    };

    const handleLeave = () => {
      hide();
      stopAnimation();
    };

    const activateInteractiveHover = (element: HTMLElement) => {
      if (hoveredInteractive === element) {
        return;
      }

      hoveredInteractive = element;
      cursor.classList.add("cursor--link");
      dot.classList.add("cursor-dot--hidden");
      applyScaleTarget();
    };

    const deactivateInteractiveHover = (element?: HTMLElement | null) => {
      if (!hoveredInteractive || (element && hoveredInteractive !== element)) {
        return;
      }

      hoveredInteractive = null;
      cursor.classList.remove("cursor--link");
      dot.classList.remove("cursor-dot--hidden");
      applyScaleTarget();
    };

    const INTERACTIVE_SELECTOR = [
      "a[href]",
      "button",
      "summary",
      "input:not([type='hidden'])",
      "select",
      "textarea",
      "label[for]",
      "[role='button']",
      "[role='link']",
      "[role='menuitem']",
      "[role='option']",
      "[tabindex]:not([tabindex='-1'])",
      "[data-cursor-interactive]",
    ].join(",");

    const findInteractiveTarget = (element: HTMLElement | null) => {
      if (!element) {
        return null;
      }

      const interactive = element.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;

      if (!interactive) {
        return null;
      }

      if (
        interactive.matches(
          ':disabled, [aria-disabled="true"], [data-cursor-interactive="false"]',
        )
      ) {
        return null;
      }

      return interactive;
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const interactive = findInteractiveTarget(target);

      if (interactive) {
        activateInteractiveHover(interactive);
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const interactive = findInteractiveTarget(target);

      if (!interactive) {
        return;
      }

      const related = event.relatedTarget as HTMLElement | null;
      if (!related || !interactive.contains(related)) {
        deactivateInteractiveHover(interactive);
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mouseenter", show);
    window.addEventListener("mouseleave", handleLeave);
    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);

    return () => {
      document.body.classList.remove("cursor-enabled");
      stopAnimation();
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mouseenter", show);
      window.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      deactivateInteractiveHover();
      hide();
    };
  }, [isDesktopPointer]);

  if (!isDesktopPointer) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot"
        data-fall-skip="true"
        aria-hidden="true"
      />
      <div
        ref={cursorRef}
        className="cursor"
        data-fall-skip="true"
        aria-hidden="true"
      />
    </>
  );
}
