"use client";

import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Trans, useTranslation } from "react-i18next";
import Link from "next/link";
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
    }));
  }, []);

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent2-200/55 via-bg/75 to-bg dark:from-accent1-800/35 dark:via-bg/85 dark:to-bg" aria-hidden />
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
            <div className="relative flex h-72 w-72 max-w-full flex-col items-center justify-center">
              <div
                className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-fg/10 bg-[radial-gradient(circle_at_30%_25%,rgba(255,223,245,0.45)_0%,rgba(205,231,255,0.22)_45%,transparent_80%)] shadow-[0_35px_90px_-45px_rgba(0,0,0,0.65)] backdrop-blur"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-transparent border-t-fg/15" aria-hidden />

              <div className="relative flex h-72 w-72 flex-col items-center justify-center gap-6">
                <div className="relative h-44 w-44 overflow-hidden rounded-full border border-fg/20 bg-fg/5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]">
                  <Image
                    src="/about-portrait.svg"
                    alt={t("about.portraitAlt")}
                    fill
                    sizes="(min-width: 1024px) 18rem, 11rem"
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="relative w-full max-w-[15rem]">
                  <div
                    className="pointer-events-none absolute inset-0 -z-10 rounded-[1.8rem] bg-[conic-gradient(from_120deg_at_50%_50%,rgba(255,223,245,0.55),rgba(205,231,255,0.45),rgba(255,223,245,0.55))] opacity-75 blur-sm"
                    aria-hidden
                  />
                  <Link
                    href="https://open.spotify.com/track/5v0AIJfxNbu74eXZOyAOXl"
                    target="_blank"
                    rel="noreferrer"
                    className="relative flex items-center gap-3 rounded-2xl border border-fg/10 bg-bg/70 p-3 text-left shadow-[0_10px_40px_-25px_rgba(0,0,0,0.45)] backdrop-blur"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-fg/15 bg-fg/10">
                      <Image
                        src="/about-portrait.svg"
                        alt={t("about.miniplayer.coverAlt")}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-fg">{t("about.miniplayer.track")}</span>
                      <span className="truncate text-xs text-fg/70">{t("about.miniplayer.artist")}</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
