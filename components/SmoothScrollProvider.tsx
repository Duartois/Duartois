"use client";

import { PropsWithChildren, useEffect } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { setSmoothScrollEngine } from "@/app/store/uiSlice";

/**
 * Detecta se o dispositivo é touch/mobile.
 * Em dispositivos touch, o scroll nativo do browser já é otimizado com
 * momentum e inércia — adicionar smooth scroll via JS aumenta latência e
 * consome CPU/memória desnecessariamente no mobile.
 */
function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

export default function SmoothScrollProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initSmoothScroll = async () => {
      if (typeof window === "undefined") {
        return;
      }

      // Em dispositivos touch/mobile, o scroll nativo é superior ao JS scroll.
      // Desabilitar o smooth scroll JS melhora significativamente a performance
      // no Chrome Mobile, Safari iOS e outros browsers mobile.
      if (isTouchDevice()) {
        return;
      }

      try {
        const [{ default: Lenis }] = await Promise.all([import("lenis")]);

        const lenis = new Lenis({
          autoRaf: true,
          smoothWheel: true,
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
        const locomotive = new (LocomotiveScroll as unknown as new (
          options: Record<string, unknown>,
        ) => {
          destroy: () => void;
        })({
          smooth: true,
          // Desabilitar smooth scroll em mobile para melhor performance nativa
          smartphone: { smooth: false },
          tablet: { smooth: false },
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
