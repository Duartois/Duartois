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

import NavHeaderContent from "./NavHeaderContent";
import {
  getDefaultPalette,
  type GradientPalette,
  type PointerTarget,
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
      ["#f6ecff", "#e2d2ff", "#cab3ff", "#b699ff"],
      ["#ffe4f5", "#ffc8e6", "#ffa6d3", "#ff8cc3"],
      ["#c9f8f5", "#9beee6", "#6dded6", "#42d0c6"],
      ["#e7ffd8", "#c9f4a8", "#a9ea7c", "#8ede60"],
      ["#fff1de", "#ffd7b0", "#ffb782", "#ff9556"],
      ["#e5ecff", "#cdd9ff", "#aebeff", "#8ca0ff"],
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
            className="absolute inset-0 bg-gradient-to-br from-[#F3EBFF] via-[#FFE9F6] to-[#E6F7FF]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
          >
            <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,#D3B8FF_0%,rgba(211,184,255,0)_70%)] blur-3xl" />
            <div className="absolute bottom-[-6rem] left-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#99F0E5_0%,rgba(153,240,229,0)_72%)] blur-3xl" />
            <div className="absolute -right-20 top-[18%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,#FFB3DF_0%,rgba(255,179,223,0)_74%)] blur-3xl" />
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
                {t("navbar.menu")}
              </span>
              <motion.span
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-[0.7rem] font-medium uppercase tracking-[0.42em] text-fg/60"
              >
                {t("navbar.menu")}
              </motion.span>
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="w-full"
              >
                <NavHeaderContent
                  variant="overlay"
                  isOpen={isOpen}
                  onToggle={onClose}
                  labels={{ open: t("navbar.open"), close: t("navbar.close") }}
                  onBrandClick={onClose}
                />
              </motion.div>
            </motion.header>

            <div className="relative flex flex-1 flex-col gap-12 px-6 pb-20 pt-10 md:flex-row md:px-12">
              <motion.div
                className="pointer-events-none flex flex-col justify-between text-left text-sm uppercase tracking-[0.42em] text-fg/70 md:w-[45%]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
              >
                <div className="flex flex-col gap-8">
                  <span className="text-[0.65rem] font-medium tracking-[0.48em] text-fg/60">
                    {t("navbar.menu")}
                  </span>
                  <p className="max-w-xs text-pretty text-[0.72rem] font-light leading-relaxed tracking-[0.28em] text-fg/70">
                    immersions in light, sound, and code — follow the path or jump to a collaboration.
                  </p>
                </div>
                <div className="hidden h-px w-24 bg-fg/15 md:block" />
              </motion.div>

              <div className="flex w-full flex-1 flex-col items-end justify-center md:w-[55%]">
                <nav aria-label={t("navbar.menu")} className="w-full">
                  <motion.ul
                    ref={navListRef}
                    className="flex w-full flex-col items-end gap-4 text-right text-[clamp(3.1rem,6.4vw,4.8rem)] font-light uppercase tracking-[0.14em] text-fg"
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
                          className="group relative inline-flex w-full items-baseline justify-end gap-6 px-2 py-1 text-right font-light text-fg/90 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg"
                        >
                          <span className="text-[clamp(0.75rem,1.4vw,0.95rem)] font-normal tracking-[0.32em] text-fg/45">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="relative inline-block overflow-hidden text-[clamp(2.5rem,4.8vw,3.9rem)] uppercase tracking-[0.2em] text-fg/90">
                            <span className="block translate-y-0 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                              {name}
                            </span>
                            <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-fg/70 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                </nav>

                <motion.div
                  className="pointer-events-auto mt-16 flex w-full flex-col items-end gap-4 text-right"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.35 }}
                >
                  <span className="flex items-center gap-3 text-[0.58rem] uppercase tracking-[0.38em] text-fg/60">
                    <span className="hidden h-px w-10 bg-fg/20 md:block" />
                    {t("navOverlay.socialHeading")}
                  </span>
                  <ul className="flex flex-col items-end gap-3 text-[0.84rem] font-light uppercase tracking-[0.32em] text-fg/75">
                    {socialLinks.map(({ label, href }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          target="_blank"
                          rel="noreferrer noopener"
                          prefetch={false}
                          className="group relative inline-flex items-center gap-3 text-fg/70 transition-colors duration-200 ease-out hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                        >
                          <span aria-hidden className="text-fg/45 transition-colors duration-200 ease-out group-hover:text-fg">
                            &gt;
                          </span>
                          <span className="relative block overflow-hidden">
                            <span className="block translate-y-0 transition-transform duration-200 ease-out group-hover:-translate-y-[2px]">
                              {label}
                            </span>
                            <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-fg/60 transition-transform duration-200 ease-out group-hover:scale-x-100" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


