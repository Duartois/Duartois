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

  const statusLabel = t(`preloader.status.${statusKey}`);
  const progressLabel = Math.round(progress);
  const isHidden = statusKey === "ready";
  const splashStyle: CSSProperties = {
    opacity: isHidden ? 0 : 1,
    display: isHidden ? "none" : "flex",
  };

  return (
    <div
      className="splashscreen"
      style={splashStyle}
      aria-hidden={isHidden}
      data-preloader-root="true"
    >
      <div className={previewClassName} aria-hidden="true">
        <PreloaderLogo />
      </div>
      <div className="loading-text-wrapper" aria-live="polite">
        <p className="loading-text">{t("preloader.title")}</p>
        <p className="visually-hidden">
          {t("preloader.progress", { value: progressLabel })}
        </p>
        <p className="visually-hidden">{statusLabel}</p>
      </div>
      <div className="credits">
        <p>Designed and coded by Matheus Duarte © 2025</p>
      </div>
    </div>
  );
}

function PreloaderLogo() {
  return (
    <svg
      data-name="deconstructedLogo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 72 72"
      width="72"
      height="72"
      className="icons-style"
    >
      {/* <circle
        id="Sphere"
        cx="31.019"
        cy="18.93"
        r="3.555"
        pathLength={1}
        strokeDashoffset="0px"
        strokeDasharray="1px 1px"
      />
      <path
        id="Magnet1"
        d="M61.028,23.378a3.555,3.555,0,0,0-6.682-2.432,4.39,4.39,0,0,1-8.25-3,3.555,3.555,0,1,0-6.682-2.432,11.5,11.5,0,0,0,21.614,7.867Z"
        pathLength={1}
        strokeDashoffset="0px"
        strokeDasharray="1px 1px"
      />
      <path
        id="Wave"
        d="M24.221,27.153a4.387,4.387,0,0,1-5.607-1.76A11.436,11.436,0,0,0,13.56,20.8a3.555,3.555,0,1,0-3.005,6.444,4.358,4.358,0,0,1,1.925,1.748,11.5,11.5,0,0,0,14.7,4.627,4.389,4.389,0,0,1,5.608,1.759,11.43,11.43,0,0,0,5.053,4.595,3.556,3.556,0,0,0,3.006-6.445,4.353,4.353,0,0,1-1.926-1.747,11.5,11.5,0,0,0-14.7-4.627Z"
        pathLength={1}
        strokeDashoffset="0px"
        strokeDasharray="1px 1px"
      />
      <path
        id="Magnet2"
        d="M13.411,43.392a3.555,3.555,0,0,0,5.825,4.078,4.39,4.39,0,1,1,7.191,5.036,3.555,3.555,0,0,0,5.825,4.078A11.5,11.5,0,1,0,13.411,43.392Z"
        pathLength={1}
        strokeDashoffset="0px"
        strokeDasharray="1px 1px"
      />
      <path
        id="OpenLoop"
        d="M61.5,47.329A11.5,11.5,0,0,0,50,35.829a3.556,3.556,0,1,0,0,7.111,4.389,4.389,0,1,1-4.39,4.389,3.556,3.556,0,0,0-7.111,0,11.5,11.5,0,0,0,23,0Z"
        pathLength={1}
        strokeDashoffset="0px"
        strokeDasharray="1px 1px"
      /> */}
    </svg>
  );
}
