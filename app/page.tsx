"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import "./i18n/config";

import { getDefaultPalette } from "../components/three/types";

export default function HomePage() {
  const { t } = useTranslation("common");

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
        <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center sm:gap-10">
          <p className="text-xs font-medium uppercase tracking-[0.45em] text-fg/65 sm:text-sm">
            {t("home.hero.kicker")}
          </p>
          <h1 className="text-balance text-4xl font-medium leading-tight text-fg sm:text-5xl md:text-6xl">
            {t("home.hero.title")}
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-fg/80 sm:text-lg">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/work"
              className="rounded-full bg-fg px-8 py-3 text-sm font-medium uppercase tracking-[0.32em] text-bg transition hover:bg-fg/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
            >
              {t("home.hero.ctaProjects")}
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-fg/30 px-8 py-3 text-sm font-medium uppercase tracking-[0.32em] text-fg transition hover:border-fg/60 hover:bg-fg/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
            >
              {t("home.hero.ctaAbout")}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
