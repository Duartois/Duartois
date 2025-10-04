"use client";

import { useEffect, useRef } from "react";

function applyTransform(
  element: HTMLDivElement,
  x: number,
  y: number,
  scale = 1,
) {
  element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const cursor = cursorRef.current;

    if (!dot || !cursor) {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: fine)");

    if (!mediaQuery.matches) {
      return;
    }

    document.body.classList.add("cursor-enabled");

    let raf = 0;
    let animationActive = false;
    const targetPosition = { x: 0, y: 0 };
    const dotPosition = { x: 0, y: 0 };
    const cursorPosition = { x: 0, y: 0 };
    let currentScale = 1;
    let targetScale = 1;
    let isHoveringLink = false;
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
      targetScale = isMouseDown || isHoveringLink ? 2 : 1;
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
      applyTransform(cursor, cursorPosition.x, cursorPosition.y, currentScale);

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

    const activateLinkHover = () => {
      if (isHoveringLink) {
        return;
      }

      isHoveringLink = true;
      cursor.classList.add("cursor--link");
      dot.classList.add("cursor-dot--hidden");
      applyScaleTarget();
    };

    const deactivateLinkHover = () => {
      if (!isHoveringLink) {
        return;
      }

      isHoveringLink = false;
      cursor.classList.remove("cursor--link");
      dot.classList.remove("cursor-dot--hidden");
      applyScaleTarget();
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");

      if (link) {
        activateLinkHover();
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (!anchor) {
        return;
      }

      const related = event.relatedTarget as HTMLElement | null;
      if (!related || !anchor.contains(related)) {
        deactivateLinkHover();
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
      hide();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={cursorRef} className="cursor" />
    </>
  );
}
