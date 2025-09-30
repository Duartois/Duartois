"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  type FocusEvent,
  type RefObject,
} from "react";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

import LanguageSwitcher from "./LanguageSwitcher";
import MenuToggleIcon from "./MenuToggleIcon";
import ThemeToggle from "./ThemeToggle";
import {
  getDefaultPalette,
  type GradientPalette,
  type PointerTarget,
  type ThreeAppHandle,
  type VariantName,
} from "./three/types";

import SharleeMonogramIcon from "./icons/SharleeMonogram";
import ArrowLaunchIcon from "./icons/ArrowLaunchIcon";

import {
  BehanceIcon,
  DribbbleIcon,
  InstagramIcon,
  LinkedInIcon,
} from "./icons/SocialIcons";


type NavigationLink = {
  name: string;
  href: string;
};

type SocialLink = {
  label: string;
  href: string;
};

type NavOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  firstLinkRef: RefObject<HTMLAnchorElement>;
  navigationLinks: readonly NavigationLink[];
  socialLinks: readonly SocialLink[];
  overlayRef: RefObject<HTMLDivElement>;
};

export default function NavOverlay({
  isOpen,
  onClose,
  firstLinkRef,
  navigationLinks,
  socialLinks,
  overlayRef,
}: NavOverlayProps) {
  const { t } = useTranslation("common");
  const overlayPalette = useMemo<GradientPalette>(
    () => [
      ["#f5eaff", "#e4d5ff", "#d4bfff", "#d1b8ff"],
      ["#ffe1f1", "#ffc9e4", "#ffadd4", "#f57bb8"],
      ["#c7fbf3", "#9df3e5", "#6fe4d6", "#4dd8cf"],
      ["#e9ffd6", "#c8f6a0", "#aeee78", "#9be26a"],
      ["#fff2de", "#ffd9b3", "#ffbb87", "#ff9a58"],
      ["#e3eaff", "#c7d8ff", "#a6c0ff", "#7da1ff"],
    ],
    [],
  );
  const pointerTargets = useMemo<Record<VariantName, PointerTarget>>(
    () => ({
      home: { x: -0.28, y: 0.22 },
      work: { x: -0.14, y: -0.18 },
      about: { x: 0.34, y: 0.18 },
      contact: { x: 0.2, y: -0.12 },
      avatar: { x: 0.06, y: 0.14 },
    }),
    [],
  );
  const initialVariantRef = useRef<VariantName | null>(null);
  const initialSceneStateRef = useRef<ReturnType<
    ThreeAppHandle["bundle"]["getState"]
  > | null>(null);
  const wasOpenRef = useRef(isOpen);
  const navListRef = useRef<HTMLUListElement | null>(null);

  const restoreInitialVariant = () => {
    const variantToRestore = initialVariantRef.current;
    if (variantToRestore) {
      const pointerTarget = pointerTargets[variantToRestore];
      window.__THREE_APP__?.setState({
        variantName: variantToRestore,
        manualPointer: pointerTarget,
      });
    }
  };

  useEffect(() => {
    const app = window.__THREE_APP__;
    if (!app) return;

    if (isOpen && !wasOpenRef.current) {
      const snapshot = app.bundle.getState();
      initialVariantRef.current = snapshot.variantName;
      initialSceneStateRef.current = snapshot;
      const pointerTarget = pointerTargets[snapshot.variantName];
      app.setState({
        palette: overlayPalette,
        parallax: false,
        hovered: true,
        cursorBoost: 0.08,
        pointerDriver: "manual",
        manualPointer: pointerTarget,
      });
    } else if (!isOpen && wasOpenRef.current) {
      const snapshot = initialSceneStateRef.current;
      if (snapshot) {
        app.setState(() => ({
          variantName: snapshot.variantName,
          palette: snapshot.palette,
          parallax: snapshot.parallax,
          hovered: false,
          cursorBoost: snapshot.cursorBoost,
          pointerDriver: snapshot.pointerDriver,
          manualPointer: snapshot.manualPointer,
        }));
      } else {
        const current = app.bundle.getState();
        app.setState({
          palette: getDefaultPalette(current.theme),
          parallax: true,
          hovered: false,
          cursorBoost: 0,
          pointerDriver: "device",
          manualPointer: { x: 0, y: 0 },
        });
      }
      initialSceneStateRef.current = null;
      initialVariantRef.current = null;
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, overlayPalette]);

  const handleLinkFocus = (variant: VariantName) => () => {
    const pointerTarget = pointerTargets[variant];
    window.__THREE_APP__?.setState({
      variantName: variant,
      manualPointer: pointerTarget,
    });
  };

  const handleLinkBlur = (event: FocusEvent<HTMLAnchorElement>) => {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (!relatedTarget || !navListRef.current?.contains(relatedTarget)) {
      restoreInitialVariant();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          id="main-navigation-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="main-navigation-title"
          tabIndex={-1}
          className="fixed inset-0 z-40 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#F9F5FF] via-[#FDF8F4] to-[#F0FBFF]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
          >
            <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,#F7E7FF_0%,rgba(255,246,233,0)_70%)] blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 translate-y-1/3 rounded-full bg-[radial-gradient(circle,#E8FFF6_0%,rgba(232,255,246,0)_70%)] blur-3xl" />
            <div className="absolute -right-16 top-1/4 h-80 w-80 rounded-full bg-[radial-gradient(circle,#E2F1FF_0%,rgba(226,241,255,0)_70%)] blur-3xl" />
          </div>

          <motion.div
            className="relative z-10 flex h-full w-full flex-col"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >

            <motion.header
              className="flex items-start justify-between px-6 pt-8 md:px-12"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
            >
              <span id="main-navigation-title" className="sr-only">

            <header className="flex items-center justify-between px-6 pt-10 text-[0.7rem] font-medium uppercase tracking-[0.42em] text-fg/60 md:px-12">
              <motion.span
                id="main-navigation-title"
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >

                {t("navbar.menu")}
              </span>
              <Link
                href="/"
                aria-label="Sharlee Studio"
                className="pointer-events-auto"
                onClick={onClose}

                className="rounded-full border border-fg/10 bg-white/70 px-4 py-2 text-[0.65rem] uppercase tracking-[0.32em] text-fg/70 shadow-soft backdrop-blur transition hover:border-fg/30 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}

              >
                <span className="inline-flex items-center rounded-full border border-fg/10 bg-white/70 px-3 py-2 shadow-soft backdrop-blur transition hover:border-fg/30 hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
                  <SharleeMonogramIcon aria-hidden />
                </span>
              </Link>

              <div className="pointer-events-auto flex flex-col items-end gap-3 text-[0.65rem] uppercase tracking-[0.32em] text-fg/60">
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-full border border-fg/12 bg-white/70 px-6 py-2 text-[0.65rem] font-medium tracking-[0.28em] text-fg/80 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:border-fg/40 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                >
                  <span>{t("navbar.close")}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fg/10 text-fg transition duration-300 ease-out group-hover:bg-fg group-hover:text-bg">
                    <MenuToggleIcon isOpen className="h-5 w-5" aria-hidden />
                  </span>
                </button>
              </div>
            </motion.header>

            <div className="relative flex flex-1 items-center justify-center px-6 pb-24 pt-12 md:px-12">
              <nav aria-label={t("navbar.menu")} className="w-full max-w-4xl">
                <motion.ul
                  ref={navListRef}
                  className="flex flex-col items-start gap-4 text-left text-[clamp(3.25rem,7vw,5rem)] font-extralight uppercase tracking-[0.14em] text-fg/90"

            <div className="relative flex flex-1 items-center justify-center px-6 pb-20 pt-10 md:px-12 md:pb-24">
              <nav aria-label={t("navbar.menu")} className="w-full md:w-auto">
                <motion.ul
                  ref={navListRef}
                  className="flex flex-col items-center gap-6 text-center text-4xl font-light uppercase tracking-[0.28em] text-fg/90 sm:text-5xl md:text-[clamp(3.25rem,6vw,4.75rem)]"

                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.08, delayChildren: 0.18 },
                    },
                  }}
                  onMouseLeave={restoreInitialVariant}
                >
                  {navigationLinks.map(({ name, href }, index) => (
                    <motion.li
                      key={href}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <Link
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={href}
                        onClick={onClose}
                        onMouseEnter={handleLinkFocus(name as VariantName)}
                        onFocus={handleLinkFocus(name as VariantName)}
                        onBlur={handleLinkBlur}

                        className="group relative inline-flex items-center px-2 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg"
                      >
                        <span className="relative inline-flex items-center gap-6 text-[clamp(2.75rem,5vw,4rem)] uppercase tracking-[0.2em] text-fg/90">
                          <span className="relative inline-block overflow-hidden">
                            <span className="block translate-y-0 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                              {name}
                            </span>
                            <span className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-fg/70 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                          </span>

                        className="group relative inline-flex items-center justify-center px-2 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg"
                      >
                        <span className="relative inline-block overflow-hidden">
                          <span className="block translate-y-0 transition-transform duration-300 ease-out group-hover:-translate-y-1">{name}</span>
                          <span className="absolute inset-x-0 bottom-0 h-[2px] origin-center scale-x-0 bg-fg/70 transition-transform duration-300 ease-out group-hover:scale-x-100" />

                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>

              <motion.div

                className="pointer-events-auto absolute bottom-12 right-10 hidden flex-col items-end gap-4 text-[0.62rem] uppercase tracking-[0.38em] text-fg/60 md:flex"

                className="pointer-events-auto absolute bottom-10 right-8 hidden flex-col items-end gap-3 text-[0.65rem] uppercase tracking-[0.38em] text-fg/60 md:flex"

                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.35 }}
              >

                <span className="flex items-center gap-3 text-fg/45">
                  <span className="hidden h-px w-10 bg-fg/30 md:block" />
                  {t("navOverlay.socialHeading")}
                </span>
                <div className="flex flex-col gap-2 text-fg/80">
                  {socialLinks.map(({ label, href }) => {

                <span className="text-fg/45">{t("navOverlay.socialHeading")}</span>
                <div className="flex flex-col gap-2 text-fg/70">
                  {socialLinks.map(({ label, href }) => {
                    const IconComponent = socialIcons[label as keyof typeof socialIcons] ?? LinkedInIcon;

                    return (
                      <Link
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        prefetch={false}

                        className="group flex items-center gap-4 rounded-full border border-fg/12 bg-white/70 px-4 py-1.5 text-[0.6rem] tracking-[0.32em] text-inherit shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:border-fg/35 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                      >
                        <span className="text-[0.58rem] tracking-[0.28em] text-current">{label}</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fg/10 text-fg/70 transition duration-300 ease-out group-hover:bg-fg group-hover:text-bg">
                          <ArrowLaunchIcon className="h-3.5 w-3.5" aria-hidden />
                        </span>

                        className="group flex items-center gap-3 rounded-full border border-fg/10 bg-white/70 px-4 py-1.5 text-[0.6rem] tracking-[0.32em] text-inherit shadow-soft backdrop-blur transition hover:border-fg/30 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fg/10 text-fg/80 transition duration-300 ease-out group-hover:bg-fg group-hover:text-bg">
                          <IconComponent className="h-3.5 w-3.5" />
                        </span>
                        <span>{label}</span>

                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


const socialIcons = {
  LinkedIn: LinkedInIcon,
  Behance: BehanceIcon,
  Dribbble: DribbbleIcon,
  Instagram: InstagramIcon,
} as const;

