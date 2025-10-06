"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { type VariantName } from "../../components/three/types";
import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";

const projectOrder = ["aurora", "mare", "spectrum"] as const;

type ProjectKey = (typeof projectOrder)[number];

type ProjectPreview = {
  variantName: VariantName;
  showDescription?: boolean;
};

type ProjectCopy = {
  title: string;
  year: string;
  description: string;
  previewAlt: string;
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

const previewGradients: Record<ProjectKey, string> = {
  aurora:
    "linear-gradient(135deg, rgba(153,185,255,0.65) 0%, rgba(255,179,194,0.55) 50%, rgba(120,255,209,0.65) 100%)",
  mare:
    "linear-gradient(135deg, rgba(120,255,209,0.6) 0%, rgba(153,185,255,0.55) 45%, rgba(48,113,147,0.65) 100%)",
  spectrum:
    "linear-gradient(135deg, rgba(255,179,194,0.6) 0%, rgba(153,185,255,0.55) 50%, rgba(240,255,166,0.65) 100%)",
};

export default function WorkPage() {
  const { t } = useTranslation("common");
  const shouldReduceMotion = useReducedMotion();
  const [activeProject, setActiveProject] = useState<ProjectKey>(projectOrder[0]);
  const { isOpen: isMenuOpen } = useMenu();
  const fallStyle = useMenuFallAnimation(2);

  useThreeSceneSetup("work", { resetOnUnmount: true });

  const projectCopy = useMemo(
    () =>
      projectOrder.reduce(
        (copy, key) => {
          copy[key] = t(`work.projects.${key}`, {
            returnObjects: true,
          }) as ProjectCopy;
          return copy;
        },
        {} as Record<ProjectKey, ProjectCopy>,
      ),
    [t],
  );

  const activePreview = projectPreviews[activeProject];
  const activeCopy = projectCopy[activeProject];

  useEffect(() => {
    window.__THREE_APP__?.setState({
      variantName: activePreview.variantName,
      parallax: false,
      hovered: true,
      opacity: 0.3,
    });
  }, [activePreview, activeProject]);

  const transition = {
    duration: 0.45,
    ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
  };

  return (
    <main className="relative z-10 flex min-h-screen w-full flex-col">
      <div
        className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-24"
        style={{
          pointerEvents: isMenuOpen ? "none" : undefined,
          opacity: isMenuOpen ? 0 : 1,
          transition: "opacity 300ms ease",
        }}
        aria-hidden={isMenuOpen}
      >
        <header
          className="page-animate space-y-4 text-center sm:text-left"
          data-hero-index={0}
          style={fallStyle(0)}
        >
          <span className="text-xs font-medium uppercase tracking-[0.4em] text-fg/60">
            {t("work.previewHint")}
          </span>
          <h1 className="text-4xl font-semibold text-fg sm:text-5xl">
            {t("work.title")}
          </h1>
          <p className="text-base text-fg/70 sm:text-lg">
            {t("work.subtitle")}
          </p>
        </header>

        <section
          className="page-animate grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
          data-hero-index={1}
          style={fallStyle(1)}
        >
          <ol className="grid gap-4">
            {projectOrder.map((projectKey) => {
              const copy = projectCopy[projectKey];
              const isActive = projectKey === activeProject;

              return (
                <li key={projectKey}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    className={`group flex w-full items-center justify-between gap-4 rounded-3xl border px-6 py-5 text-left transition backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg ${
                      isActive
                        ? "border-transparent bg-fg text-bg shadow-[0_20px_50px_-30px_rgba(0,0,0,0.65)]"
                        : "border-fg/15 bg-bg/70 text-fg/80 hover:border-fg/30 hover:bg-bg/85"
                    }`}
                    onClick={() => setActiveProject(projectKey)}
                    onPointerEnter={() => {
                      if (!isActive) {
                        setActiveProject(projectKey);
                      }
                    }}
                    onFocus={() => {
                      if (!isActive) {
                        setActiveProject(projectKey);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs font-semibold uppercase tracking-[0.35em] ${
                          isActive ? "text-bg/70" : "text-fg/60"
                        }`}
                      >
                        {copy.year}
                      </span>
                      <span
                        className={`text-2xl font-semibold transition-colors ${
                          isActive ? "text-bg" : "text-fg"
                        }`}
                      >
                        {copy.title}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className={`text-2xl transition-transform duration-300 ease-pleasant ${
                        isActive ? "translate-x-1" : "translate-x-0 text-fg/40 group-hover:translate-x-1"
                      }`}
                    >
                      ↗
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="relative">
            <div className="h-full rounded-3xl border border-fg/15 bg-bg/70 p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.65)] backdrop-blur">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeProject}
                  initial={
                    shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -24 }}
                  transition={transition}
                  className="flex h-full flex-col gap-6"
                >
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.35em] text-fg/60">
                      {activeCopy.year}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-fg">
                      {activeCopy.title}
                    </h2>
                  </div>

                  {(activePreview.showDescription ?? true) && (
                    <p className="max-w-2xl text-base text-fg/70 sm:text-lg">
                      {activeCopy.description}
                    </p>
                  )}

                  <figure className="mt-auto overflow-hidden rounded-2xl border border-fg/10 bg-bg/80">
                    <div
                      className="aspect-[4/3] w-full"
                      style={{ background: previewGradients[activeProject] }}
                    />
                    <figcaption className="visually-hidden">
                      {activeCopy.previewAlt}
                    </figcaption>
                  </figure>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
