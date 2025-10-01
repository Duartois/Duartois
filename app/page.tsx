"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import AnimatedText from "../components/AnimatedText";
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
      opacity: 1,
    }));
  }, []);

  return (
    <>
      <Navbar />
      <main className="relative z-10 flex min-h-screen w-full flex-col">
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center sm:px-10 md:py-32 bg-bg/70">
          <div className="flex w-full max-w-3xl flex-col items-center gap-8 sm:gap-10">
            <AnimatedText
              as="span"
              underline={false}
              trigger="none"
              className="hero-animate text-sm font-light lowercase tracking-[0.28em] text-muted/80 sm:text-base"
              data-hero-index="0"
            >
              {t("home.hero.kicker")}
            </AnimatedText>
            <AnimatedText
              as="h1"
              underline={false}
              trigger="none"
              className="hero-animate block text-balance text-4xl font-light lowercase leading-tight text-fg sm:text-5xl md:text-6xl"
              data-hero-index="1"
            >
              {t("home.hero.title")}
            </AnimatedText>
            <AnimatedText
              as="p"
              underline={false}
              trigger="none"
              className="hero-animate block max-w-2xl text-pretty text-base font-light lowercase text-muted sm:text-lg"
              data-hero-index="2"
            >
              {t("home.hero.subtitle")}
            </AnimatedText>
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
