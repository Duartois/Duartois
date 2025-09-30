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

import {
  getDefaultPalette,
  type GradientPalette,
  type ThreeAppHandle,
  type VariantName,
} from "./three/types";

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
  const initialVariantRef = useRef<VariantName | null>(null);
  const initialSceneStateRef = useRef<ReturnType<
    ThreeAppHandle["bundle"]["getState"]
  > | null>(null);
  const wasOpenRef = useRef(isOpen);
  const navListRef = useRef<HTMLUListElement | null>(null);

  const restoreInitialVariant = () => {
    const variantToRestore = initialVariantRef.current;
    if (variantToRestore) {
      window.__THREE_APP__?.setState({ variantName: variantToRestore });
    }
  };

  useEffect(() => {
    const app = window.__THREE_APP__;
    if (!app) return;

    if (isOpen && !wasOpenRef.current) {
      const snapshot = app.bundle.getState();
      initialVariantRef.current = snapshot.variantName;
      initialSceneStateRef.current = snapshot;
      app.setState({
        palette: overlayPalette,
        parallax: false,
        hovered: true,
      });
    } else if (!isOpen && wasOpenRef.current) {
      const snapshot = initialSceneStateRef.current;
      if (snapshot) {
        app.setState(() => ({
          variantName: snapshot.variantName,
          palette: snapshot.palette,
          parallax: snapshot.parallax,
          hovered: false,
        }));
      } else {
        const current = app.bundle.getState();
        app.setState({
          palette: getDefaultPalette(current.theme),
          parallax: true,
          hovered: false,
        });
      }
      initialSceneStateRef.current = null;
      initialVariantRef.current = null;
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, overlayPalette]);

  const handleLinkFocus = (variant: VariantName) => () => {
    window.__THREE_APP__?.setState({ variantName: variant });
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
            className="absolute inset-0 bg-gradient-to-br from-brand-900 via-accent2-900/90 to-accent3-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-35 mix-blend-screen"
            aria-hidden
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,214,255,0.35)_0%,rgba(193,235,255,0.18)_40%,transparent_75%)]" />
            <div className="absolute left-1/2 top-1/2 h-[min(60vh,32rem)] w-[min(60vh,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,rgba(255,240,254,0.55)_0deg,rgba(206,235,255,0.35)_140deg,rgba(255,214,240,0.4)_260deg,rgba(255,240,254,0.55)_360deg)] blur-3xl" />
          </div>

          <motion.div
            className="relative z-10 flex h-full w-full flex-col"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between px-6 pt-10 text-xs font-medium uppercase tracking-[0.42em] text-fg/60 md:px-12">
              <motion.span
                id="main-navigation-title"
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {t("navbar.menu")}
              </motion.span>
              <motion.button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 rounded-full bg-fg/10 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-fg transition hover:bg-fg/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                {t("navbar.closeMenu")}
              </motion.button>
            </header>

            <div className="flex flex-1 flex-col justify-end gap-16 px-6 pb-12 text-left md:flex-row md:items-end md:justify-between md:px-12 md:pb-16">
              <nav aria-label={t("navbar.menu")} className="w-full md:w-auto">
                <motion.ul
                  ref={navListRef}
                  className="flex flex-col gap-6 text-4xl font-medium uppercase tracking-[0.26em] text-fg sm:text-5xl md:text-[clamp(3rem,6vw,4.5rem)]"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
                    },
                  }}
                  onMouseLeave={restoreInitialVariant}
                >
                  {navigationLinks.map(({ name, href }, index) => (
                    <motion.li
                      key={href}
                      variants={{
                        hidden: { opacity: 0, y: 24 },
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
                        className="group flex items-center gap-6 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg"
                      >
                        <span className="text-sm font-medium tracking-[0.38em] text-fg/45">0{index + 1}</span>
                        <span className="relative">
                          <span className="block transition duration-300 ease-out group-hover:-translate-y-1">{name}</span>
                          <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-fg/80 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>

              <motion.div
                className="flex w-full flex-col gap-8 text-sm font-medium uppercase tracking-[0.32em] text-fg/60 md:w-64"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <div className="flex flex-col gap-2 text-xs tracking-[0.4em] text-fg/40">
                  <span>{t("navOverlay.socialHeading")}</span>
                  <div className="h-px w-16 bg-fg/20" />
                </div>
                <div className="flex flex-col gap-2 text-xs font-medium tracking-[0.4em] text-fg/40">
                  {socialLinks.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      prefetch={false}
                      className="rounded-full bg-fg/10 px-5 py-2 transition hover:bg-fg/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
