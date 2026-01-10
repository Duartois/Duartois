"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

import type { ThreeAppState } from "./three/types";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { CRITICAL_ASSET_URLS } from "@/app/helpers/criticalAssets";

type PreloaderStatus = "fonts" | "assets" | "scene" | "idle" | "ready";

type PreloaderProps = {
  onComplete?: () => void;
};

const STATIC_PREVIEW_STYLES = "h-48 w-48 rounded-full bg-fg/10";
const INITIAL_PROGRESS = 12;
const MIN_VISIBLE_TIME = 3500;
const READY_EXIT_BUFFER = 350;
const FONT_PROGRESS_TARGET = 55;
const ASSET_PROGRESS_START = 55;
const ASSET_PROGRESS_END = 88;
const STATUS_PROGRESS_CEILINGS: Record<PreloaderStatus, number> = {
  fonts: 48,
  assets: 88,
  scene: 96,
  idle: 100,
  ready: 100,
};

export default function Preloader({ onComplete }: PreloaderProps) {
  const [statusKey, setStatusKey] = useState<PreloaderStatus>("fonts");
  const [progress, setProgress] = useState(INITIAL_PROGRESS);
  const [targetProgress, setTargetProgress] = useState(INITIAL_PROGRESS);
  const hasFinalizedRef = useRef(false);
  const hasSignaledCompletionRef = useRef(false);
  const readyTimeoutRef = useRef<number>();
  const progressFrameRef = useRef<number>();
  const targetProgressRef = useRef(INITIAL_PROGRESS);
  const progressRef = useRef(INITIAL_PROGRESS);
  const entryStartedRef = useRef(false);
  const isHidingRef = useRef(false);
  const mountTimeRef = useRef<number>(
    typeof performance !== "undefined" ? performance.now() : Date.now(),
  );
  const { t } = useTranslation("common");
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const logoControls = useAnimationControls();
  const textControls = useAnimationControls();
  const creditsControls = useAnimationControls();
  const criticalAssets = useMemo(() => CRITICAL_ASSET_URLS, []);
  const totalAssets = criticalAssets.length;
  const [fontsReady, setFontsReady] = useState(false);
  const [assetsReady, setAssetsReady] = useState(totalAssets === 0);
  const [sceneReady, setSceneReady] = useState(false);

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
    if (hasFinalizedRef.current) {
      return;
    }

    hasFinalizedRef.current = true;

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = now - mountTimeRef.current;
    const remaining = Math.max(MIN_VISIBLE_TIME - elapsed, 0);
    const readyDelay = Math.max(remaining - READY_EXIT_BUFFER, 0);

    setTargetProgress(100);

    if (readyDelay > 0) {
      readyTimeoutRef.current = window.setTimeout(() => {
        readyTimeoutRef.current = undefined;
        setStatusKey("ready");
      }, readyDelay);
    } else {
      setStatusKey("ready");
    }
  }, []);

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
        setTargetProgress((current) =>
          current < FONT_PROGRESS_TARGET ? FONT_PROGRESS_TARGET : current,
        );
        setFontsReady(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fontsReady) {
      return;
    }

    if (!assetsReady) {
      setStatusKey((current) => (current === "fonts" ? "assets" : current));
      return;
    }

    setStatusKey((current) => {
      if (current === "fonts" || current === "assets") {
        return "scene";
      }
      return current;
    });
  }, [assetsReady, fontsReady]);

  useEffect(() => {
    if (!fontsReady || assetsReady) {
      return;
    }

    let cancelled = false;
    const uniqueAssets = Array.from(new Set(criticalAssets));

    if (uniqueAssets.length === 0) {
      setAssetsReady(true);
      return;
    }

    let completed = 0;

    const updateAssetProgress = () => {
      if (uniqueAssets.length === 0) {
        return;
      }

      const ratio = completed / uniqueAssets.length;
      const span = ASSET_PROGRESS_END - ASSET_PROGRESS_START;
      const nextTarget = ASSET_PROGRESS_START + span * ratio;
      setTargetProgress((current) =>
        current < nextTarget ? nextTarget : current,
      );
    };

    const loaders = uniqueAssets.map((url) =>
      preloadImage(url).then(() => {
        if (cancelled) {
          return;
        }
        completed += 1;
        updateAssetProgress();
      }),
    );

    Promise.all(loaders).then(() => {
      if (cancelled) {
        return;
      }
      setTargetProgress((current) =>
        current < ASSET_PROGRESS_END ? ASSET_PROGRESS_END : current,
      );
      setAssetsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [assetsReady, criticalAssets, fontsReady]);

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
          setSceneReady(true);
        }
      };

      const handleReady = () => {
        setSceneReady(true);
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
    if (!fontsReady || !assetsReady || !sceneReady) {
      return;
    }

    setTargetProgress((current) => (current < 100 ? 100 : current));
    setStatusKey((current) => {
      if (current === "ready") {
        return current;
      }

      return "idle";
    });
    finalizeLoading();
  }, [assetsReady, finalizeLoading, fontsReady, sceneReady]);

  useEffect(() => {
    if (statusKey === "idle" || statusKey === "ready") {
      return;
    }

    const ceiling = STATUS_PROGRESS_CEILINGS[statusKey];

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

  const previewClassName = STATIC_PREVIEW_STYLES;

  const isHiding = statusKey === "ready";
  useEffect(() => {
    isHidingRef.current = isHiding;
  }, [isHiding]);
  const statusLabel = t(`preloader.status.${statusKey}`);
  const progressLabel = Math.round(progress);
  const entryEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const exitEase: [number, number, number, number] = [0.4, 0, 1, 1];
  const entryOffset = -96;
  const overlayExitDurationMs = prefersReducedMotion ? 0 : 450;
  const entryLogoDuration = prefersReducedMotion ? 0.01 : 0.75;
  const entryTextDuration = prefersReducedMotion ? 0.01 : 0.55;
  const entryCreditsDuration = prefersReducedMotion ? 0.01 : 0.55;
  const entryTextDelay = prefersReducedMotion ? 0 : 0.25;
  const entryCreditsDelay = prefersReducedMotion ? 0 : 0.35;
  const exitTextDuration = prefersReducedMotion ? 0.01 : 0.25;
  const exitLogoDuration = prefersReducedMotion ? 0.01 : 0.28;
  const staggerEntry = prefersReducedMotion ? 0 : 0.085;
  const staggerExit = prefersReducedMotion ? 0 : 0.03;
  const idleConfig = useMemo(
    () => [
      { ampY: 3.4, ampR: 1.6, duration: 2.15 },
      { ampY: 4.6, ampR: 2.4, duration: 2.55 },
      { ampY: 2.8, ampR: 1.2, duration: 1.95 },
      { ampY: 5.0, ampR: 2.9, duration: 2.8 },
      { ampY: 3.1, ampR: 2.1, duration: 2.35 },
    ],
    [],
  );

  const logoGroupVariants = {
    initial: {},
    enter: {
      transition: {
        staggerChildren: staggerEntry,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
    idle: {},
    exit: {
      transition: {
        staggerChildren: staggerExit,
        staggerDirection: -1,
      },
    },
  };

  const logoPieceVariants = {
    initial: {
      opacity: 0,
      y: entryOffset,
      strokeDashoffset: 1,
    },
    enter: {
      opacity: 1,
      y: 0,
      strokeDashoffset: 0,
      transition: {
        duration: entryLogoDuration,
        ease: entryEase,
      },
    },
    idle: (custom: { ampY: number; ampR: number; duration: number }) =>
      prefersReducedMotion
        ? {}
        : {
            y: [0, custom.ampY, 0],
            rotate: [0, custom.ampR, 0],
            transition: {
              duration: custom.duration,
              ease: "easeInOut",
              repeat: Infinity,
            },
          },
    exit: {
      opacity: 0,
      y: entryOffset,
      strokeDashoffset: 1,
      transition: {
        duration: exitLogoDuration,
        ease: exitEase,
      },
    },
  };

  const textVariants = {
    initial: {
      opacity: 0,
      y: entryOffset,
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        duration: entryTextDuration,
        delay: entryTextDelay,
        ease: entryEase,
      },
    },
    exit: {
      opacity: 0,
      y: entryOffset,
      transition: {
        duration: exitTextDuration,
        ease: exitEase,
      },
    },
  };

  const creditsVariants = {
    initial: {
      opacity: 0,
      y: entryOffset,
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        duration: entryCreditsDuration,
        delay: entryCreditsDelay,
        ease: entryEase,
      },
    },
    exit: {
      opacity: 0,
      y: entryOffset,
      transition: {
        duration: exitTextDuration,
        ease: exitEase,
      },
    },
  };

  useEffect(() => {
    let isCancelled = false;
    if (entryStartedRef.current) {
      return undefined;
    }
    entryStartedRef.current = true;

    const startEntry = async () => {
      await Promise.all([
        logoControls.start("enter"),
        textControls.start("enter"),
        creditsControls.start("enter"),
      ]);

      if (!isCancelled && !prefersReducedMotion && !isHidingRef.current) {
        logoControls.start("idle");
      }
    };

    startEntry();

    return () => {
      isCancelled = true;
    };
  }, [
    creditsControls,
    logoControls,
    prefersReducedMotion,
    textControls,
  ]);

  useEffect(() => {
    if (!isHiding) {
      return;
    }

    let cancelled = false;

    const runExit = async () => {
      logoControls.stop();
      textControls.stop();
      creditsControls.stop();

      await Promise.all([
        logoControls.start("exit"),
        textControls.start("exit"),
        creditsControls.start("exit"),
      ]);

      if (!prefersReducedMotion && overlayExitDurationMs > 0) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, overlayExitDurationMs);
        });
      }

      if (!cancelled && !hasSignaledCompletionRef.current) {
        hasSignaledCompletionRef.current = true;
        onComplete?.();
      }
    };

    runExit();

    return () => {
      cancelled = true;
    };
  }, [
    creditsControls,
    isHiding,
    logoControls,
    onComplete,
    overlayExitDurationMs,
    prefersReducedMotion,
    textControls,
  ]);

  return (
    <div
      className="splashscreen"
      data-fall-skip="true"
      data-state={isHiding ? "hiding" : "visible"}
      aria-hidden={isHiding}
      data-preloader-root="true"
    >
      <div className={previewClassName} aria-hidden="true">
        <PreloaderLogo
          controls={logoControls}
          groupVariants={logoGroupVariants}
          pieceVariants={logoPieceVariants}
          idleConfig={idleConfig}
        />
      </div>
      <motion.div
        className="loading-text-wrapper"
        aria-live="polite"
        initial="initial"
        animate={textControls}
        variants={textVariants}
        style={{ translateZ: 0 }}
      >
        <p className="loading-text">
          <FallWordFragments text={t("preloader.title")} />
        </p>
        <p className="visually-hidden">
          {t("preloader.progress", { value: progressLabel })}
        </p>
        <p className="visually-hidden">{statusLabel}</p>
      </motion.div>
      <motion.div
        className="credits"
        initial="initial"
        animate={creditsControls}
        variants={creditsVariants}
        style={{ translateZ: 0 }}
      >
        <p>Designed and coded by Matheus Duarte © 2025</p>
      </motion.div>
    </div>
  );
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();

    const cleanup = () => {
      image.removeEventListener("load", cleanup);
      image.removeEventListener("error", cleanup);
      resolve();
    };

    image.addEventListener("load", cleanup);
    image.addEventListener("error", cleanup);
    image.decoding = "async";
    image.src = url;

    if (image.complete) {
      cleanup();
    }
  });
}

function FallWordFragments({ text }: { text: string }) {
  const parts = text.split(/\s+/).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => (
        <span
          key={`${part}-${index}`}
          data-fall-target="true"
          style={{ display: "inline-block" }}
        >
          {part}
          {index < parts.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

function PreloaderLogo({
  controls,
  groupVariants,
  pieceVariants,
  idleConfig,
}: {
  controls: ReturnType<typeof useAnimationControls>;
  groupVariants: {
    initial: object;
    enter: object;
    idle: object;
    exit: object;
  };
  pieceVariants: {
    initial: object;
    enter: object;
    idle: (custom: { ampY: number; ampR: number; duration: number }) => object;
    exit: object;
  };
  idleConfig: Array<{ ampY: number; ampR: number; duration: number }>;
}) {
  return (
    <motion.svg
      data-name="deconstructedLogo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 72 72"
      width="72"
      height="72"
      className="icons-style"
      initial="initial"
      animate={controls}
      variants={groupVariants}
      style={{ translateZ: 0 }}
    >
      <motion.circle
        id="Sphere"
        cx="31.019"
        cy="18.93"
        r="3.555"
        pathLength={1}
        strokeDasharray="1"
        variants={pieceVariants}
        custom={idleConfig[0]}
        style={{ transformOrigin: "center" }}
      />
      <motion.path
        id="Magnet1"
        d="M61.028,23.378a3.555,3.555,0,0,0-6.682-2.432,4.39,4.39,0,0,1-8.25-3,3.555,3.555,0,1,0-6.682-2.432,11.5,11.5,0,0,0,21.614,7.867Z"
        pathLength={1}
        strokeDasharray="1"
        variants={pieceVariants}
        custom={idleConfig[1]}
        style={{ transformOrigin: "center" }}
      />
      <motion.path
        id="Wave"
        d="M24.221,27.153a4.387,4.387,0,0,1-5.607-1.76A11.436,11.436,0,0,0,13.56,20.8a3.555,3.555,0,1,0-3.005,6.444,4.358,4.358,0,0,1,1.925,1.748,11.5,11.5,0,0,0,14.7,4.627,4.389,4.389,0,0,1,5.608,1.759,11.43,11.43,0,0,0,5.053,4.595,3.556,3.556,0,0,0,3.006-6.445,4.353,4.353,0,0,1-1.926-1.747,11.5,11.5,0,0,0-14.7-4.627Z"
        pathLength={1}
        strokeDasharray="1"
        variants={pieceVariants}
        custom={idleConfig[2]}
        style={{ transformOrigin: "center" }}
      />
      <motion.path
        id="Magnet2"
        d="M13.411,43.392a3.555,3.555,0,0,0,5.825,4.078,4.39,4.39,0,1,1,7.191,5.036,3.555,3.555,0,0,0,5.825,4.078A11.5,11.5,0,1,0,13.411,43.392Z"
        pathLength={1}
        strokeDasharray="1"
        variants={pieceVariants}
        custom={idleConfig[3]}
        style={{ transformOrigin: "center" }}
      />
      <motion.path
        id="OpenLoop"
        d="M61.5,47.329A11.5,11.5,0,0,0,50,35.829a3.556,3.556,0,1,0,0,7.111,4.389,4.389,0,1,1-4.39,4.389,3.556,3.556,0,0,0-7.111,0,11.5,11.5,0,0,0,23,0Z"
        pathLength={1}
        strokeDasharray="1"
        variants={pieceVariants}
        custom={idleConfig[4]}
        style={{ transformOrigin: "center" }}
      />
    </motion.svg>
  );
}
