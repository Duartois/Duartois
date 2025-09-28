"use client";

import Image from "next/image";
import Experience from "../../components/Experience";
import Navbar from "../../components/Navbar";
import { useTranslation } from "react-i18next";
import "../i18n/config";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Experience variant="about" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/35 via-bg/80 to-bg" aria-hidden />
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center lg:gap-16">
          <section className="flex-1 space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-fg/60">
              {t("about.kicker")}
            </p>
            <h1 className="text-4xl font-semibold text-fg sm:text-5xl">
              {t("about.title")}
            </h1>
            <div className="space-y-4 text-base text-fg/80 sm:text-lg">
              <p>{t("about.paragraphs.first")}</p>
              <p>{t("about.paragraphs.second")}</p>
              <p>{t("about.paragraphs.third")}</p>
            </div>
          </section>
          <section className="flex flex-1 justify-center lg:justify-end">
            <div className="relative h-80 w-80 overflow-hidden rounded-full border border-fg/20 bg-gradient-to-br from-fg/10 via-transparent to-transparent shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]">
              <Image
                src="/images/about-portrait.svg"
                alt={t("about.visualCaption")}
                fill
                className="object-cover"
                sizes="320px"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-transparent to-bg/20" aria-hidden />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
