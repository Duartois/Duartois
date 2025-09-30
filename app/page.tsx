"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import "./i18n/config";

import { getDefaultPalette } from "../components/three/types";
import { WaveUnderline } from "../components/WaveUnderline";

export default function HomePage() {
  const { t } = useTranslation("common");

  const heroRoles = t("home.hero.subtitle")
    .split("·")
    .map((role) => role.trim())
    .filter(Boolean);

  const parseArrowLabel = (label: string) => {
    const trimmed = label.trim();

    if (trimmed.startsWith("→")) {
      return {
        arrow: "→",
        text: trimmed.slice(1).trimStart(),
      };
    }

    return { text: label };
  };

  const projectLabel = parseArrowLabel(t("home.hero.ctaProjects"));
  const aboutLabel = parseArrowLabel(t("home.hero.ctaAbout"));

  useEffect(() => {
    window.__THREE_APP__?.setState((previous) => ({
      variantName: "home",
      palette: getDefaultPalette(previous.theme),
      parallax: true,
      hovered: false,
    }));
  }, []);

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-200/55 via-bg/70 to-bg dark:from-accent2-700/35 dark:via-bg/80 dark:to-bg" aria-hidden />
        <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-24 text-left sm:gap-12 sm:px-10 md:py-32">
          <div className="flex flex-col gap-6 sm:gap-8">
            <h1 className="text-balance text-4xl font-semibold uppercase leading-[1.05] tracking-[0.28em] text-fg sm:text-5xl md:text-6xl">
              {t("home.hero.kicker")} {" "}
              <WaveUnderline underlineClassName="text-brand-400">
                <span className="tracking-[0.18em]">{t("home.hero.name")}</span>
              </WaveUnderline>
            </h1>
            <h2 className="text-balance text-4xl font-semibold uppercase leading-[1.05] tracking-[0.28em] text-fg sm:text-5xl md:text-6xl">
              {t("home.hero.title")} {" "}
              <WaveUnderline underlineClassName="text-accent2-400">
                <span className="tracking-[0.18em]">{t("home.hero.alias")}</span>
              </WaveUnderline>
            </h2>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-fg/70 sm:text-xs md:text-sm">
              {heroRoles.map((role, index) => (
                <Fragment key={`${role}-${index}`}>
                  <span>{role}</span>
                  {index < heroRoles.length - 1 && (
                    <span aria-hidden className="hidden h-1 w-1 rounded-full bg-fg/35 sm:inline-block" />
                  )}
                </Fragment>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-fg sm:text-xs md:text-sm">
              <Link
                href="/work"
                className="group inline-flex items-center gap-2 transition-colors duration-200 hover:text-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 dark:hover:text-brand-300"
              >
                {projectLabel.arrow && (
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1">
                    {projectLabel.arrow}
                  </span>
                )}
                <span className="tracking-[0.24em]">{projectLabel.text}</span>
              </Link>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 transition-colors duration-200 hover:text-accent2-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent2-400"
              >
                {aboutLabel.arrow && (
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1">
                    {aboutLabel.arrow}
                  </span>
                )}
                <span className="tracking-[0.24em]">{aboutLabel.text}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
