"use client";

import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Trans, useTranslation } from "react-i18next";
import Link from "next/link";
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
            <div className="relative h-72 w-72 max-w-full rounded-full border border-fg/10 bg-[radial-gradient(circle_at_30%_25%,rgba(255,223,245,0.45)_0%,rgba(205,231,255,0.22)_45%,transparent_80%)] shadow-[0_35px_90px_-45px_rgba(0,0,0,0.65)] backdrop-blur">
              <div className="absolute inset-4 rounded-full border border-fg/20" aria-hidden />
              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-transparent border-t-fg/15" aria-hidden />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
