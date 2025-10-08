"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";

export default function ContactPage() {
  const { t } = useTranslation("common");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");
  const { isOpen: isMenuOpen } = useMenu();
  const fallStyle = useMenuFallAnimation(2);

  useThreeSceneSetup("contact");

  useEffect(() => {
    window.__THREE_APP__?.setState({ opacity: isMenuOpen ? 1 : 0.3 });
  }, [isMenuOpen]);

  useEffect(() => {
    if (status !== "submitted") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setStatus("idle");
    }, 6000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [status]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    form.reset();
    setStatus("submitted");
  };

  return (
    <main className="relative z-10 flex min-h-screen w-full flex-col">
      <div
        className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-24 text-center sm:text-left"
        style={{
          pointerEvents: isMenuOpen ? "none" : undefined,
          opacity: isMenuOpen ? 0 : 1,
          transition: "opacity 300ms ease",
        }}
        aria-hidden={isMenuOpen}
      >
        <div
          className="page-animate space-y-4 text-center sm:text-left"
          data-hero-index={0}
          style={fallStyle(0)}
        >
          <h1 className="text-4xl font-semibold text-fg sm:text-5xl">
            {t("contact.title")}
          </h1>
          <p className="text-base text-fg/70 sm:text-lg">
            {t("contact.subtitle")}
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="page-animate w-full space-y-4 rounded-3xl border border-fg/15 bg-bg/75 p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.6)] backdrop-blur"
          data-hero-index={1}
          style={fallStyle(1)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-left text-sm font-medium uppercase tracking-[0.3em] text-fg/70">
              <span>{t("contact.form.nameLabel")}</span>
              <input
                type="text"
                name="name"
                required
                className="rounded-full border border-fg/20 bg-transparent px-4 py-3 text-base text-fg placeholder:text-fg/40 focus:border-fg/50 focus:outline-none focus:ring-2 focus:ring-fg/30"
                placeholder={t("contact.form.namePlaceholder")}
              />
            </label>
            <label className="flex flex-col gap-2 text-left text-sm font-medium uppercase tracking-[0.3em] text-fg/70">
              <span>{t("contact.form.emailLabel")}</span>
              <input
                type="email"
                name="email"
                required
                className="rounded-full border border-fg/20 bg-transparent px-4 py-3 text-base text-fg placeholder:text-fg/40 focus:border-fg/50 focus:outline-none focus:ring-2 focus:ring-fg/30"
                placeholder={t("contact.form.emailPlaceholder")}
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-left text-sm font-medium uppercase tracking-[0.3em] text-fg/70">
            <span>{t("contact.form.messageLabel")}</span>
            <textarea
              name="message"
              required
              rows={5}
              className="rounded-3xl border border-fg/20 bg-transparent px-4 py-4 text-base text-fg placeholder:text-fg/40 focus:border-fg/50 focus:outline-none focus:ring-2 focus:ring-fg/30"
              placeholder={t("contact.form.messagePlaceholder")}
            />
          </label>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <button
              type="submit"
              className="w-full rounded-full bg-fg px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-bg transition hover:bg-fg/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg sm:w-auto"
            >
              {t("contact.form.submit")}
            </button>
            <div className="min-h-[1.5rem] text-sm text-fg/70" aria-live="polite">
              {status === "submitted" ? t("contact.form.success") : ""}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
