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
      <main className="relative z-10 flex min-h-screen w-full flex-col">
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center sm:px-10 md:py-32 bg-bg/70 backdrop-blur">
          <div className="flex w-full max-w-3xl flex-col items-center gap-8 sm:gap-10">
            <span className="hero-animate text-sm font-light lowercase tracking-[0.28em] text-muted/80 sm:text-base" data-hero-index="0">
              {t("home.hero.kicker")}
            </span>
            <h1 className="hero-animate text-balance text-4xl font-light lowercase leading-tight text-fg sm:text-5xl md:text-6xl" data-hero-index="1">
              {t("home.hero.title")}
            </h1>
            <p className="hero-animate max-w-2xl text-pretty text-base font-light lowercase text-muted sm:text-lg" data-hero-index="2">
              {t("home.hero.subtitle")}
            </p>
            <div className="hero-animate flex flex-col items-center gap-3 sm:flex-row" data-hero-index="3">
              <Link
                href="/work"
                className="hero-button"
              >
                {t("home.hero.ctaProjects")}
              </Link>
              <Link
                href="/about"
                className="hero-button hero-button--ghost"
              >
                {t("home.hero.ctaAbout")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
