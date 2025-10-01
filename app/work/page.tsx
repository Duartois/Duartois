"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Navbar from "../../components/Navbar";
import AnimatedText from "../../components/AnimatedText";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { getDefaultPalette, type GradientPalette, type VariantName } from "../../components/three/types";

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
    ["#CFFAFE", "#A5F3FC", "#67E8F9", "#22D3EE"],
    ["#FEE2E2", "#FCA5A5", "#F87171", "#EF4444"],
  ],
  mare: [
    ["#BBF7D0", "#86EFAC", "#4ADE80", "#10B981"],
    ["#BAE6FD", "#7DD3FC", "#38BDF8", "#0284C7"],
    ["#DDD6FE", "#C4B5FD", "#A78BFA", "#7C3AED"],
    ["#99F6E4", "#5EEAD4", "#2DD4BF", "#14B8A6"],
    ["#FDE68A", "#FCD34D", "#FBBF24", "#D97706"],
    ["#FECACA", "#FCA5A5", "#F87171", "#DC2626"],
  ],
  spectrum: [
    ["#FDE68A", "#FCD34D", "#FBBF24", "#FACC15"],
    ["#FBCFE8", "#F472B6", "#F04F9A", "#EC4899"],
    ["#BAE6FD", "#7DD3FC", "#38BDF8", "#3B82F6"],
    ["#C7D2FE", "#A5B4FF", "#818CF8", "#6366F1"],
    ["#BBF7D0", "#86EFAC", "#4ADE80", "#22C55E"],
    ["#DDD6FE", "#C4B5FD", "#A78BFA", "#8B5CF6"],
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

  const previewGradient = useMemo(() => {
    const [c1, c2, c3, c4] = activePreview.palette[0];
    return `linear-gradient(135deg, ${c1} 0%, ${c2} 35%, ${c3} 65%, ${c4} 100%)`;
  }, [activePreview]);

  useEffect(() => {
    window.__THREE_APP__?.setState((previous) => ({
      variantName: "work",
      palette: getDefaultPalette(previous.theme),
      parallax: true,
      hovered: false,
    }));
  }, []);

  useEffect(() => {
    const preview = activePreview;
    window.__THREE_APP__?.setState({
      variantName: preview.variantName,
      palette: preview.palette,
      parallax: false,
      hovered: true,
    });
  }, [activePreview]);

  useEffect(() => {
    return () => {
      window.__THREE_APP__?.setState((previous) => ({
        variantName: "work",
        palette: getDefaultPalette(previous.theme),
        parallax: true,
        hovered: false,
      }));
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="relative z-10 flex min-h-screen w-full flex-col">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center lg:gap-20 bg-bg/70 backdrop-blur">
          <section className="lg:w-1/2">
            <AnimatedText
              as="p"
              underline={false}
              trigger="none"
              className="block text-xs font-medium uppercase tracking-[0.42em] text-fg/65"
            >
              {t("work.previewHint")}
            </AnimatedText>
            <AnimatedText
              as="h1"
              underline={false}
              trigger="none"
              className="mt-4 block text-4xl font-medium text-fg sm:text-5xl"
            >
              {t("work.title")}
            </AnimatedText>
            <AnimatedText
              as="p"
              underline={false}
              trigger="none"
              className="mt-6 block max-w-xl text-base leading-relaxed text-fg/80 sm:text-lg"
            >
              {t("work.subtitle")}
            </AnimatedText>
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
                    <AnimatedText
                      as="span"
                      underline={false}
                      trigger="self"
                      className="block text-lg font-medium uppercase tracking-[0.28em] text-fg"
                    >
                      {t(`work.projects.${projectKey}.title`)}
                    </AnimatedText>
                    <span className="text-sm font-medium text-fg/55">
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
                  <div
                    className="absolute inset-0"
                    style={{ background: previewGradient }}
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-bg/20 to-bg/40" aria-hidden />
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
                        <p className="text-pretty text-base leading-relaxed text-fg/85 sm:text-lg">
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
