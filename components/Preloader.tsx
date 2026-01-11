"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

import type { ThreeAppState } from "./three/types";
import {
  motion,
  type Variants,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { CRITICAL_ASSET_URLS } from "@/app/helpers/criticalAssets";

type PreloaderStatus = "fonts" | "assets" | "scene" | "idle" | "ready";

type PreloaderProps = {
  onComplete?: () => void;
};

const STATIC_PREVIEW_STYLES =
  "flex h-48 w-48 items-center justify-center rounded-full bg-fg/10";
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
  const idleEase: [number, number, number, number] = [0.42, 0, 0.58, 1];
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
              ease: idleEase,
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
      <div
        className={previewClassName}
        aria-hidden="true"
        style={{ transform: "translateY(52px)" }}
      >
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
  groupVariants: Variants;
  pieceVariants: Variants;
  idleConfig: Array<{ ampY: number; ampR: number; duration: number }>;
}) {
  return (
    <motion.svg
      data-name="deconstructedLogo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 474 358"
      width="128"
      height="128"
      className="icons-style"
      initial="initial"
      animate={controls}
      variants={groupVariants}
      preserveAspectRatio="xMidYMid meet"
      style={{ translateZ: 0 }}
    >
      <motion.path
        id="BaseWave"
        d="M152.983 347C94.2985 347 45.7051 306.564 37.2766 253.839C35.6219 243.488 40.2441 233.389 47.788 226.11C62.4297 211.983 85.5198 211.637 100.578 225.32L101.091 225.786C109.302 233.246 112.941 244.471 118.29 254.19C124.764 265.954 137.869 274 152.983 274C168.542 274 181.972 265.473 188.231 253.14C192.928 243.885 196.174 233.414 203.605 226.169C218.129 212.01 241.147 211.551 256.224 225.119L256.912 225.737C265.232 233.225 270.39 243.973 268.496 255.005C259.543 307.159 211.234 347 152.983 347Z"
        pathLength={1}
        strokeDasharray="1"
        variants={pieceVariants}
        custom={idleConfig[2]}
        strokeWidth={12}
        style={{ transformOrigin: "center" }}
      />
      <motion.path
        id="CoreShape"
        d="M163.986 5C80.3013 5 13.5034 64.6834 5.21662 142.296C3.67664 156.72 10.532 170.78 21.2954 181.06C43.0688 201.856 76.7407 202.361 97.4656 182.201L98.1532 181.532C108.996 170.985 113.357 155.459 119.756 141.684C128.01 123.913 146.431 111.667 168.317 111.667C198.877 111.667 224.621 135.545 225.817 165C226.719 187.199 213.419 206.231 193.73 214.26C180.991 219.455 167.216 223.84 157.616 233.57C136.876 254.591 138.307 289.474 160.955 310.279C171.241 319.728 184.697 325.373 198.219 323.696C279.435 313.623 339.792 246.413 336.486 165C332.897 76.6344 255.666 5 163.986 5Z"
        pathLength={1}
        strokeDasharray="1"
        variants={pieceVariants}
        custom={idleConfig[4]}
        strokeWidth={12}
        style={{ transformOrigin: "center" }}
      />
            <g transform="matrix(0.989521 -0.14439 -0.169429 -0.985543 368.986 356.854)">
        <motion.rect
          id="SideBar"
          width="69.1299"
          height="230.201"
          rx="34.565"
          pathLength={1}
          strokeDasharray="1"
          variants={pieceVariants}
          custom={idleConfig[1]}
          strokeWidth={12}
          style={{
            transformOrigin: "center",
            transformBox: "fill-box",
          }}
        />
      </g>

      <motion.path
        id="Accent"
        d="M362.378 156.771C321.716 168.224 294.73 199.608 295.996 230.915C296.349 239.662 303.271 246.532 311.604 249.871C323.934 254.812 337.872 251.102 345.591 240.827L345.902 240.413C351.42 233.067 351.926 222.676 356.125 214.511C359.572 207.808 366.715 202.08 375.995 199.466C385.686 196.737 395.417 198.048 402.282 202.281C409.85 206.949 415.731 214.838 423.966 218.185C436.225 223.166 450.131 219.537 457.87 209.337L458.287 208.787C463.891 201.402 465.954 191.43 460.655 183.53C443.077 157.321 402.608 145.439 362.378 156.771Z"
        pathLength={1}
        strokeDasharray="1"
        variants={pieceVariants}
        custom={idleConfig[3]}
        strokeWidth={12}
        style={{ transformOrigin: "center" }}
      />
      <motion.circle
        id="CoreDot"
        cx="170.984"
        cy="165"
        r="34"
        pathLength={1}
        strokeDasharray="1"
        variants={pieceVariants}
        custom={idleConfig[0]}
        strokeWidth={12}
        style={{ transformOrigin: "center" }}
      />
    </motion.svg>
  );
}
