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
    let latestX = 0;
    let latestY = 0;

    const show = () => {
      dot.style.opacity = "1";
      cursor.style.opacity = "1";
    };

    const hide = () => {
      dot.style.opacity = "0";
      cursor.style.opacity = "0";
    };

    const update = (scale = 1) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        applyTransform(dot, latestX, latestY);
        applyTransform(cursor, latestX, latestY, scale);
      });
    };

    const handleMove = (event: MouseEvent) => {
      latestX = event.clientX;
      latestY = event.clientY;
      show();
      update();
    };

    const handleDown = () => {
      update(0.85);
    };

    const handleUp = () => {
      update();
    };

    const handleLeave = () => {
      hide();
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mouseenter", show);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      document.body.classList.remove("cursor-enabled");
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mouseenter", show);
      window.removeEventListener("mouseleave", handleLeave);
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
