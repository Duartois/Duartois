"use client";

import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import AnimatedText from "../../components/AnimatedText";
import Link from "next/link";
import { Trans, useTranslation } from "react-i18next";
import Image from "next/image";
import "../i18n/config";

import { getDefaultPalette } from "../../components/three/types";

export default function AboutPage() {
  const { t } = useTranslation("common");

  useEffect(() => {
    window.__THREE_APP__?.setState((previous) => ({
      variantName: "about",
      palette: getDefaultPalette(previous.theme),
      parallax: true,
      hovered: false,
      opacity: 0.3,
    }));
  }, []);

  return (
    <>
      <Navbar />
      <main className="relative z-10 flex min-h-screen w-full flex-col">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-24 lg:flex-row lg:items-center lg:gap-24 bg-bg/70">
          <section className="flex-1 space-y-6">
            <AnimatedText
              as="p"
              underline={false}
              trigger="none"
              className="block text-xs font-medium uppercase tracking-[0.42em] text-fg/65"
            >
              {t("about.kicker")}
            </AnimatedText>
            <div className="space-y-4">
              <AnimatedText
                as="h1"
                underline={false}
                trigger="none"
                className="block text-5xl font-semibold text-fg sm:text-6xl"
              >
                {t("about.title")}
              </AnimatedText>
              <AnimatedText
                as="p"
                underline={false}
                trigger="none"
                className="block text-lg text-fg/70 sm:text-xl"
              >
                {t("about.subtitle")}
              </AnimatedText>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-fg/80 sm:text-lg">
              <AnimatedText
                as="p"
                underline={false}
                trigger="none"
                className="block lowercase"
              >
                {t("about.paragraphs.first")}
              </AnimatedText>
              <AnimatedText
                as="p"
                underline={false}
                trigger="none"
                className="block lowercase"
              >
                {t("about.paragraphs.second")}
              </AnimatedText>
              <AnimatedText
                as="p"
                underline={false}
                trigger="none"
                className="block lowercase"
              >
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
              </AnimatedText>
            </div>
            <div className="flex flex-wrap gap-3 pt-6">
              <Link
                href="/Duartois-Resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-transparent bg-fg px-6 py-3 text-sm font-semibold text-bg shadow-[0_18px_40px_-22px_rgba(0,0,0,0.65)] transition hover:-translate-y-0.5 hover:bg-fg/90"
              >
                <span>{t("about.cta.resume")}</span>
                <span aria-hidden className="text-base transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
              </Link>
              <Link
                href="mailto:hello@duartois.studio"
                className="inline-flex items-center gap-2 rounded-full border border-fg/20 bg-bg/80 px-6 py-3 text-sm font-semibold text-fg shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)] transition hover:-translate-y-0.5 hover:border-fg/35"
              >
                <span>{t("about.cta.contact")}</span>
              </Link>
            </div>
          </section>
          <section className="flex flex-1 justify-center lg:justify-end">
            <div className="relative flex h-[22rem] w-[22rem] max-w-full items-center justify-center">
              <div
                className="pointer-events-none absolute inset-0 -z-20 rounded-full border border-fg/10 bg-fg/10 shadow-[0_35px_90px_-45px_rgba(0,0,0,0.65)]"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-[-6%] -z-10 animate-[spin_24s_linear_infinite] rounded-full border border-transparent border-t-azure/50 border-b-flamingo/50" aria-hidden />
              <div className="pointer-events-none absolute inset-[16%] rounded-full border border-fg/10 opacity-60" aria-hidden />
              <div className="relative h-56 w-56 overflow-hidden rounded-full border border-fg/15 shadow-[0_28px_60px_-30px_rgba(0,0,0,0.65)]">
                <Image
                  src="/about/profile.jpg"
                  alt={t("about.portraitAlt")}
                  fill
                  sizes="(min-width: 1024px) 20rem, 14rem"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="pointer-events-none absolute -left-6 top-0 h-20 w-20 rounded-full bg-azure/15 blur-2xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-10 right-0 h-24 w-24 rounded-full bg-flamingo/20 blur-3xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-6 -left-10 h-28 w-28">
                <div className="relative h-full w-full">
                  <Image
                    src="/about/badge.svg"
                    alt={t("about.badgeAlt")}
                    fill
                    className="object-contain"
                    sizes="7rem"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
