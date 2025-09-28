"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import "./i18n/config";

const Experience = dynamic(() => import("../components/three/Experience"), {
  ssr: false,
});

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Experience variant="home" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/80 to-bg" aria-hidden />
        </div>
        <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center sm:gap-10">
          <p className="text-xs uppercase tracking-[0.4em] text-fg/60 sm:text-sm">
            {t("home.kicker")}
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-tight text-fg sm:text-5xl md:text-6xl">
            {t("home.title")}
          </h1>
          <p className="max-w-2xl text-pretty text-base text-fg/80 sm:text-lg">
            {t("home.subtitle")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/work"
              className="rounded-full bg-fg px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-bg transition hover:bg-fg/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
            >
              {t("home.ctaProjects")}
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-fg/30 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-fg transition hover:border-fg/60 hover:bg-fg/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
            >
              {t("home.ctaAbout")}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
