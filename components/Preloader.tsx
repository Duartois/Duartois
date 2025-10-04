"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

import type { ThreeAppState } from "./three/types";

type PreloaderStatus = "fonts" | "scene" | "idle" | "ready";

type PreloaderProps = {
  onComplete?: () => void;
};

const STATIC_PREVIEW_STYLES = "h-48 w-48 rounded-full bg-fg/10";
const INITIAL_PROGRESS = 12;
const MIN_VISIBLE_TIME = 900;
const READY_EXIT_BUFFER = 200;

export default function Preloader({ onComplete }: PreloaderProps) {
  const [statusKey, setStatusKey] = useState<PreloaderStatus>("fonts");
  const [progress, setProgress] = useState(INITIAL_PROGRESS);
  const [targetProgress, setTargetProgress] = useState(INITIAL_PROGRESS);
  const hasCompletedRef = useRef(false);
  const completionTimeoutRef = useRef<number>();
  const readyTimeoutRef = useRef<number>();
  const progressFrameRef = useRef<number>();
  const targetProgressRef = useRef(INITIAL_PROGRESS);
  const progressRef = useRef(INITIAL_PROGRESS);
  const mountTimeRef = useRef<number>(
    typeof performance !== "undefined" ? performance.now() : Date.now(),
  );
  const { t } = useTranslation("common");
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    mountTimeRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();
  }, []);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    targetProgressRef.current = targetProgress;
  }, [targetProgress]);

  const finalizeLoading = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = now - mountTimeRef.current;
    const remaining = Math.max(MIN_VISIBLE_TIME - elapsed, 0);
    const readyDelay = Math.max(remaining - READY_EXIT_BUFFER, 0);

    if (readyDelay > 0) {
      readyTimeoutRef.current = window.setTimeout(() => {
        readyTimeoutRef.current = undefined;
        setStatusKey("ready");
      }, readyDelay);
    } else {
      setStatusKey("ready");
    }

    completionTimeoutRef.current = window.setTimeout(() => {
      completionTimeoutRef.current = undefined;
      onComplete?.();
    }, remaining + READY_EXIT_BUFFER);
  }, [onComplete]);

  useEffect(() => {
    if (progressFrameRef.current) {
      cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = undefined;
    }

    if (targetProgressRef.current <= progressRef.current) {
      return;
    }

    const step = () => {
      setProgress((current) => {
        const target = targetProgressRef.current;
        if (current >= target) {
          progressFrameRef.current = undefined;
          return target;
        }

        const diff = target - current;
        const increment = Math.max(diff * 0.18, 0.8);
        const next = current + increment;

        if (next < target) {
          progressFrameRef.current = requestAnimationFrame(step);
          return next;
        }

        progressFrameRef.current = undefined;
        return target;
      });
    };

    progressFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (progressFrameRef.current) {
        cancelAnimationFrame(progressFrameRef.current);
        progressFrameRef.current = undefined;
      }
    };
  }, [targetProgress]);

  useEffect(() => {
    return () => {
      if (progressFrameRef.current) {
        cancelAnimationFrame(progressFrameRef.current);
      }
      if (completionTimeoutRef.current !== undefined) {
        window.clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = undefined;
      }
      if (readyTimeoutRef.current !== undefined) {
        window.clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = undefined;
      }
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    (typeof document !== "undefined" && "fonts" in document
      ? document.fonts.ready.catch(() => undefined)
      : Promise.resolve()
    ).then(() => {
      if (!isCancelled) {
        setTargetProgress((current) => (current < 55 ? 55 : current));
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
          setTargetProgress(100);
          setStatusKey((current) => {
            if (current === "ready") return current;
            return "idle";
          });
          finalizeLoading();
        }
      };

      const handleReady = () => {
        setTargetProgress(100);
        setStatusKey("idle");
        finalizeLoading();
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
  }, [finalizeLoading, hasMounted]);

  useEffect(() => {
    if (statusKey === "idle" || statusKey === "ready") {
      return;
    }

    const ceiling = statusKey === "fonts" ? 48 : 96;

    const interval = window.setInterval(() => {
      setTargetProgress((current) => {
        if (current >= ceiling) {
          return current;
        }

        return Math.min(current + 1.5, ceiling);
      });
    }, 180);

    return () => {
      window.clearInterval(interval);
    };
  }, [statusKey]);

  const previewClassName = prefersReducedMotion
    ? STATIC_PREVIEW_STYLES
    : "h-48 w-48 animate-pulse rounded-full bg-fg/10";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg/95 backdrop-blur"
      role="status"
      aria-live="polite"
    >
      <div className={`${previewClassName} fall-down-element`} style={{ "--fall-delay": "0.1s" } as CSSProperties} aria-hidden />
      <div className="fall-down-element text-center text-fg" style={{ "--fall-delay": "0.2s" } as CSSProperties}>
        <p className="text-lg font-semibold tracking-wide">{t("preloader.title")}</p>
        <p className="mt-1 text-sm font-medium text-fg/70" aria-live="polite">
          {t(`preloader.status.${statusKey}`)}
        </p>
        <p className="mt-1 text-xs font-medium text-fg/60" aria-live="polite">
          {t("preloader.progress", { value: Math.round(progress) })}
        </p>
      </div>
    </div>
  );
}
