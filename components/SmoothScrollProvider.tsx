"use client";

import { PropsWithChildren, useEffect } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { setSmoothScrollEngine } from "@/app/store/uiSlice";

export default function SmoothScrollProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initSmoothScroll = async () => {
      if (typeof window === "undefined") {
        return;
      }

      try {
        const [{ default: Lenis }] = await Promise.all([import("lenis")]);

        const lenis = new Lenis({
          autoRaf: true,
          smoothWheel: true,
          touchMultiplier: 1.1,
          lerp: 0.1,
        });

        dispatch(setSmoothScrollEngine("lenis"));

        cleanup = () => {
          lenis.destroy();
        };
        return;
      } catch {
        // fallback abaixo
      }

      try {
        const LocomotiveScroll = (await import("locomotive-scroll")).default;
        const locomotive = new (LocomotiveScroll as unknown as new (options: Record<string, unknown>) => {
          destroy: () => void;
        })({
          smooth: true,
          smartphone: { smooth: true },
          tablet: { smooth: true },
        });

        dispatch(setSmoothScrollEngine("locomotive"));

        cleanup = () => {
          locomotive.destroy();
        };
      } catch (error) {
        console.error("Falha ao inicializar smooth scrolling", error);
      }
    };

    initSmoothScroll();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [dispatch]);

  return children;
}
