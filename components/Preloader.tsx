"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

import type { ThreeAppState } from "./three/types";

type PreloaderStatus = "fonts" | "scene" | "idle" | "ready";

type PreloaderProps = {
  onComplete?: () => void;
};

const STATIC_PREVIEW_STYLES = "h-48 w-48 rounded-full bg-fg/10";

export default function Preloader({ onComplete }: PreloaderProps) {
  const [statusKey, setStatusKey] = useState<PreloaderStatus>("fonts");
  const [progress, setProgress] = useState(0);
  const hasCompletedRef = useRef(false);
  const idleTimeoutRef = useRef<number>();
  const { t } = useTranslation("common");
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fontsPromise = (typeof document !== "undefined" && "fonts" in document
      ? document.fonts.ready.catch(() => undefined)
      : Promise.resolve()
    ).then(() => {
      if (!isCancelled) {
        setProgress((current) => (current < 50 ? 50 : current));
        setStatusKey((current) => (current === "fonts" ? "scene" : current));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    let cancelled = false;
    let detach: (() => void) | null = null;

    const connect = () => {
      if (cancelled) return;
      const app = window.__THREE_APP__;
      if (!app) {
        requestAnimationFrame(connect);
        return;
      }

      const handleStateChange = (event: Event) => {
        const detail = (event as CustomEvent<{ state: ThreeAppState }>).detail;
        if (!detail) return;
        if (detail.state.ready) {
          setProgress(100);
          setStatusKey((current) => {
            if (current === "ready") return current;
            return "idle";
          });
        }
      };

      const handleReady = () => {
        setProgress(100);
        setStatusKey("idle");
      };

      const events = app.bundle.events;
      events.addEventListener("ready", handleReady);
      events.addEventListener("statechange", handleStateChange);

      const snapshot = app.bundle.getState();
      if (snapshot.ready) {
        handleReady();
      }

      detach = () => {
        events.removeEventListener("ready", handleReady);
        events.removeEventListener("statechange", handleStateChange);
      };
    };

    connect();

    return () => {
      cancelled = true;
      detach?.();
    };
  }, [hasMounted]);

  useEffect(() => {
    if (statusKey !== "idle" || hasCompletedRef.current) {
      return;
    }

    idleTimeoutRef.current = window.setTimeout(() => {
      idleTimeoutRef.current = undefined;
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setStatusKey("ready");
        onComplete?.();
      }
    }, 350);

    return () => {
      if (idleTimeoutRef.current !== undefined) {
        window.clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = undefined;
      }
    };
  }, [onComplete, statusKey]);

  const previewClassName = prefersReducedMotion
    ? STATIC_PREVIEW_STYLES
    : "h-48 w-48 animate-pulse rounded-full bg-fg/10";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg/95 backdrop-blur"
      role="status"
      aria-live="polite"
    >
      <div className={previewClassName} aria-hidden />
      <div className="text-center text-fg">
        <p className="text-lg font-semibold tracking-wide">{t("preloader.title")}</p>
        <p className="mt-1 text-sm font-medium text-fg/70" aria-live="polite">
          {t(`preloader.status.${statusKey}`)}
        </p>
        <p className="mt-1 text-xs font-medium text-fg/60" aria-live="polite">
          {t("preloader.progress", { value: progress })}
        </p>
      </div>
    </div>
  );
}
