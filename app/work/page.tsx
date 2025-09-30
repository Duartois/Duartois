"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import Navbar from "../../components/Navbar";
import { useTranslation } from "react-i18next";
import "../i18n/config";
import { variantMapping, type VariantName } from "../../store/variants";
import type { GradientPalette } from "../../components/three/ProceduralShapes";

const Experience = dynamic(
  () => import("../../components/three/Experience"),
  { ssr: false }
);

const ProceduralShapes = dynamic(
  () => import("../../components/three/ProceduralShapes"),
  { ssr: false },
);

const projectOrder = ["aurora", "mare", "spectrum"] as const;

type ProjectKey = (typeof projectOrder)[number];

type ProjectPreview = {
  id: ProjectKey;
  variantName: VariantName;
  palette: GradientPalette;
  showDescription?: boolean;
};

const previewPalettes: Record<ProjectKey, GradientPalette> = {
  aurora: [
    ["#C7D2FE", "#A5B4FF", "#7C8BFF", "#4F46E5"],
    ["#BFDBFE", "#93C5FD", "#5EA3F4", "#2563EB"],
    ["#FDE68A", "#FACA61", "#F6A53D", "#F97316"],
    ["#F9A8D4", "#F472B6", "#F04F9A", "#EC4899"],
  ],
  mare: [
    ["#BBF7D0", "#86EFAC", "#4ADE80", "#10B981"],
    ["#BAE6FD", "#7DD3FC", "#38BDF8", "#0284C7"],
    ["#DDD6FE", "#C4B5FD", "#A78BFA", "#7C3AED"],
    ["#99F6E4", "#5EEAD4", "#2DD4BF", "#14B8A6"],
  ],
  spectrum: [
    ["#FDE68A", "#FCD34D", "#FBBF24", "#FACC15"],
    ["#FBCFE8", "#F472B6", "#F04F9A", "#EC4899"],
    ["#BAE6FD", "#7DD3FC", "#38BDF8", "#3B82F6"],
    ["#C7D2FE", "#A5B4FF", "#818CF8", "#6366F1"],
  ],
};

const projectPreviews: ProjectPreview[] = [
  {
    id: "aurora",
    variantName: "home",
    palette: previewPalettes.aurora,
  },
  {
    id: "mare",
    variantName: "about",
    palette: previewPalettes.mare,
    showDescription: true,
  },
  {
    id: "spectrum",
    variantName: "work",
    palette: previewPalettes.spectrum,
  },
];

export default function WorkPage() {
  const { t } = useTranslation("common");
  const [activeProject, setActiveProject] = useState<ProjectKey>(projectOrder[0]);
  const shouldReduceMotion = useReducedMotion();

  const activePreview = projectPreviews.find(
    (preview) => preview.id === activeProject,
  )!;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Experience variant="work" className="pointer-events-auto" />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent3-200/55 via-bg/70 to-bg dark:from-accent2-800/35 dark:via-bg/85 dark:to-bg"
            aria-hidden
          />
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center lg:gap-20">
          <section className="lg:w-1/2">
            <p className="text-xs uppercase tracking-[0.4em] text-fg/60">
              {t("work.previewHint")}
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-fg sm:text-5xl">
              {t("work.title")}
            </h1>
            <p className="mt-6 max-w-xl text-base text-fg/80 sm:text-lg">
              {t("work.subtitle")}
            </p>
            <ul className="mt-10 flex flex-col gap-3">
              {projectOrder.map((projectKey) => (
                <li key={projectKey}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveProject(projectKey)}
                    onFocus={() => setActiveProject(projectKey)}
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-6 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg sm:px-8 ${
                      activeProject === projectKey
                        ? "border-fg/60 bg-fg/10"
                        : "border-fg/20 bg-bg/60 hover:border-fg/40 hover:bg-fg/5"
                    }`}
                  >
                    <span className="text-lg font-semibold uppercase tracking-[0.3em] text-fg">
                      {t(`work.projects.${projectKey}.title`)}
                    </span>
                    <span className="text-sm font-medium text-fg/60">
                      {t(`work.projects.${projectKey}.year`)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="relative flex w-full flex-1 items-center justify-center">
            <div
              className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl border border-fg/15 bg-bg/80 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur"
              role="img"
              aria-label={t(`work.projects.${activePreview.id}.previewAlt`)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activePreview.id}
                  className="absolute inset-0"
                  initial={{
                    opacity: shouldReduceMotion ? 1 : 0,
                    y: shouldReduceMotion ? 0 : 16,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: shouldReduceMotion ? 1 : 0,
                    y: shouldReduceMotion ? 0 : -16,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Canvas
                    camera={{ position: [0, 0, 6], fov: 42 }}
                    gl={{ antialias: true, alpha: true }}
                    dpr={[1, 2]}
                    className="h-full w-full"
                  >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 6, 8]} intensity={1.2} />
                    <Suspense fallback={null}>
                      <ProceduralShapes
                        variantOverride={variantMapping[activePreview.variantName]}
                        palette={activePreview.palette}
                        parallax={false}
                      />
                    </Suspense>
                  </Canvas>
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-bg/20 to-bg/40"
                    aria-hidden
                  />
                  <AnimatePresence initial={false}>
                    {activePreview.showDescription ? (
                      <motion.div
                        key={`${activePreview.id}-description`}
                        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/85 via-bg/65 to-transparent p-8"
                        initial={{
                          opacity: shouldReduceMotion ? 1 : 0,
                          y: shouldReduceMotion ? 0 : 12,
                        }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: shouldReduceMotion ? 1 : 0,
                          y: shouldReduceMotion ? 0 : 12,
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.35,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <p className="text-pretty text-base text-fg/85 sm:text-lg">
                          {t(`work.projects.${activePreview.id}.description`)}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
