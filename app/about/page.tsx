"use client";

import Link from "next/link";
import Image from "next/image";
import { Trans, useTranslation } from "react-i18next";
import "../i18n/config";

import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";

export default function AboutPage() {
  const { t } = useTranslation("common");

  useThreeSceneSetup("about");

  return (
    <main className="relative z-10 flex min-h-screen w-full flex-col">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center gap-16 px-6 py-24">
        <header
          className="page-animate space-y-4 text-center sm:text-left"
          data-hero-index={0}
        >
          <span className="text-xs font-medium uppercase tracking-[0.4em] text-fg/60">
            {t("about.kicker")}
          </span>
          <h1 className="text-4xl font-semibold text-fg sm:text-5xl">
            {t("about.title")}
          </h1>
          <p className="text-base text-fg/70 sm:text-lg">
            {t("about.subtitle")}
          </p>
        </header>

        <section
          className="page-animate grid w-full gap-12 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center"
          data-hero-index={1}
        >
          <div className="space-y-6 text-center text-base leading-relaxed text-fg/70 sm:text-lg md:text-left">
            <p>{t("about.paragraphs.first")}</p>
            <p>{t("about.paragraphs.second")}</p>
            <p>
              <Trans
                i18nKey="about.paragraphs.third"
                components={{
                  github: (
                    <Link
                      href="https://github.com/duartois"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-fg hover:text-fg/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                    />
                  ),
                }}
              />
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
              <a
                href="/files/resume.pdf"
                className="w-full rounded-full border border-fg/20 bg-fg px-8 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-bg transition hover:bg-fg/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg sm:w-auto"
              >
                {t("about.cta.resume")}
              </a>
              <Link
                href="/contact"
                className="w-full rounded-full border border-fg/20 px-8 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-fg transition hover:border-fg/40 hover:bg-bg/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg sm:w-auto"
              >
                {t("about.cta.contact")}
              </Link>
            </div>
          </div>

          <div className="relative flex w-full justify-center md:justify-end">
            <div className="relative w-full max-w-sm">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[3rem] border border-fg/10 bg-bg/60 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-[3rem] border border-fg/15 bg-bg/80 p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.65)] backdrop-blur">
                <Image
                  src="/about-portrait.svg"
                  alt={t("about.portraitAlt")}
                  width={640}
                  height={640}
                  className="h-auto w-full"
                  priority
                />
                <div className="mt-6 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.4em] text-fg/60">
                  <Image
                    src="/wave.svg"
                    alt={t("about.badgeAlt")}
                    width={72}
                    height={72}
                    className="h-16 w-16"
                  />
                  <span>{t("about.kicker")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
