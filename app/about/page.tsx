"use client";

import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import { Trans, useTranslation } from "react-i18next";
import Link from "next/link";
import "../i18n/config";

const Experience = dynamic(
  () => import("../../components/three/Experience"),
  { ssr: false },
);

const AvatarOrb = dynamic(() => import("../../components/three/AvatarOrb"), {
  ssr: false,
});

export default function AboutPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Experience variant="about" className="pointer-events-auto" />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent2-200/55 via-bg/75 to-bg dark:from-accent1-800/35 dark:via-bg/85 dark:to-bg"
            aria-hidden
          />
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center lg:gap-16">
          <section className="flex-1 space-y-6">
            <p className="text-xs font-medium uppercase tracking-[0.42em] text-fg/65">
              {t("about.kicker")}
            </p>
            <h1 className="text-4xl font-medium text-fg sm:text-5xl">
              {t("about.title")}
            </h1>
            <div className="space-y-4 text-base leading-relaxed text-fg/80 sm:text-lg">
              <p>{t("about.paragraphs.first")}</p>
              <p>{t("about.paragraphs.second")}</p>
              <p>
                <Trans
                  i18nKey="about.paragraphs.third"
                  ns="common"
                  components={{
                    github: (
                      <Link
                        href="https://github.com/Duartois"
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-fg underline decoration-dotted underline-offset-4 transition hover:text-fg/80"
                      />
                    ),
                  }}
                />
              </p>
            </div>
          </section>
          <section className="flex flex-1 justify-center lg:justify-end">
            <AvatarOrb />
          </section>
        </div>
      </main>
    </>
  );
}
