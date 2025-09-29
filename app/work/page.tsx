"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import { useTranslation } from "react-i18next";
import "../i18n/config";

const Experience = dynamic(
  () => import("../../components/three/Experience"),
  { ssr: false }
);

const projectOrder = ["aurora", "mare", "spectrum"] as const;

type ProjectKey = (typeof projectOrder)[number];

type ProjectPreview = {
  id: ProjectKey;
  type: "image" | "description";
  imageSrc?: string;
};

const projectPreviews: ProjectPreview[] = [
  { id: "aurora", type: "image", imageSrc: "/images/project-aurora.svg" },
  { id: "mare", type: "description" },
  { id: "spectrum", type: "image", imageSrc: "/images/project-spectrum.svg" },
];

export default function WorkPage() {
  const { t } = useTranslation();
  const [activeProject, setActiveProject] = useState<ProjectKey>(projectOrder[0]);

  const activePreview = projectPreviews.find((preview) => preview.id === activeProject)!;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Experience variant="work" />
          <div
            className="absolute inset-0 bg-gradient-to-b from-accent3-200/55 via-bg/70 to-bg dark:from-accent2-800/35 dark:via-bg/85 dark:to-bg"
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
            <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl border border-fg/15 bg-bg/80 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur">
              {activePreview.type === "image" && activePreview.imageSrc ? (
                <Image
                  src={activePreview.imageSrc}
                  alt={t(`work.projects.${activePreview.id}.previewAlt`)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 80vw, 480px"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-10">
                  <p className="text-pretty text-lg text-fg/80">
                    {t(`work.projects.${activePreview.id}.description`)}
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-bg/20 to-bg/40" aria-hidden />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
