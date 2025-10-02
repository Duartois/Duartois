"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Navbar from "../../components/Navbar";
import AnimatedText from "../../components/AnimatedText";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { type VariantName } from "../../components/three/types";
import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";

const projectOrder = ["aurora", "mare", "spectrum"] as const;

type ProjectKey = (typeof projectOrder)[number];

type ProjectPreview = {
  variantName: VariantName;
  showDescription?: boolean;
};

const projectPreviews: Record<ProjectKey, ProjectPreview> = {
  aurora: {
    variantName: "home",
  },
  mare: {
    variantName: "about",
    showDescription: true,
  },
  spectrum: {
    variantName: "work",
  },
};

export default function WorkPage() {
  const { t } = useTranslation("common");
  const [activeProject, setActiveProject] = useState<ProjectKey>(projectOrder[0]);
  const shouldReduceMotion = useReducedMotion();

  const activePreview = projectPreviews[activeProject];

  useThreeSceneSetup("work", { resetOnUnmount: true });

  useEffect(() => {
    const preview = activePreview;
    window.__THREE_APP__?.setState({
      variantName: preview.variantName,
      parallax: false,
      hovered: true,
      opacity: 0.3,
    });
  }, [activePreview]);


  return (
    <>
      <Navbar />
      <main className="relative z-10 flex min-h-screen w-full flex-col">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center lg:gap-20 bg-bg/70">
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
              className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl border border-fg/15 bg-bg/80 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]"
              role="img"
              aria-label={t(`work.projects.${activeProject}.previewAlt`)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeProject}
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
                  <div className="absolute inset-0 bg-fg/10" aria-hidden />
                  <div className="absolute inset-0 bg-bg/40" aria-hidden />
                  <AnimatePresence initial={false}>
                    {activePreview.showDescription ? (
                      <motion.div
                        key={`${activeProject}-description`}
                        className="pointer-events-none absolute inset-x-0 bottom-0 bg-bg/80 p-8"
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
                          {t(`work.projects.${activeProject}.description`)}
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
