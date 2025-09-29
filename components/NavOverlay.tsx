"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, type RefObject, type FocusEvent } from "react";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";
import {
  useVariantStore,
  type VariantName,
} from "../store/variants";

const OrganicShapeFallback = () => (
  <div className="h-full w-full animate-pulse rounded-full bg-accent2-200/20" />
);

const ProceduralCanvas = dynamic(() => import("./three/ProceduralCanvas"), {
  ssr: false,
  loading: () => <OrganicShapeFallback />,
});

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
  const setVariant = useVariantStore((state) => state.setVariant);
  const currentVariantName = useVariantStore((state) => state.variantName);
  const initialVariantRef = useRef<VariantName>(currentVariantName);
  const wasOpenRef = useRef(isOpen);
  const navListRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      initialVariantRef.current = currentVariantName;
    } else if (!isOpen && wasOpenRef.current) {
      setVariant(initialVariantRef.current);
    }

    wasOpenRef.current = isOpen;
  }, [currentVariantName, isOpen, setVariant]);

  const overlayPalette = useMemo(
    () => [
      { colorA: "#f5eaff", colorB: "#d1b8ff" },
      { colorA: "#ffe1f1", colorB: "#f57bb8" },
      { colorA: "#c7fbf3", colorB: "#4dd8cf" },
      { colorA: "#e9ffd6", colorB: "#9be26a" },
    ],
    []
  );

  const overlayLights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.58} color="#ffe9ff" />
        <directionalLight position={[4.5, 5.2, 7.5]} intensity={1.2} color="#ffb7d8" />
        <directionalLight position={[-3.2, -4.1, -2.5]} intensity={0.42} color="#8fc5ff" />
      </>
    ),
    []
  );

  const handleLinkFocus = (variant: VariantName) => () => {
    setVariant(variant);
  };

  const handleLinkBlur = (event: FocusEvent<HTMLAnchorElement>) => {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (!relatedTarget || !navListRef.current?.contains(relatedTarget)) {
      setVariant(initialVariantRef.current);
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
            <Suspense fallback={<OrganicShapeFallback />}>
              <div className="absolute left-1/2 top-1/2 h-[min(60vh,32rem)] w-[min(60vh,32rem)] -translate-x-1/2 -translate-y-1/2 blur-sm">
                <ProceduralCanvas
                  className="h-full w-full"
                  camera={{ position: [0, 0, 6], fov: 42 }}
                  dpr={[1, 1.75]}
                  palette={overlayPalette}
                  parallax={false}
                  lights={overlayLights}
                />
                <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(229,211,255,0.35)_0%,rgba(180,212,255,0.15)_45%,transparent_70%)]" />
              </div>
            </Suspense>
          </div>

          <motion.div
            className="relative z-10 flex h-full w-full flex-col"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between px-6 pt-10 text-xs uppercase tracking-[0.4em] text-fg/60 md:px-12">
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
                className="flex items-center gap-2 rounded-full bg-fg/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-fg transition hover:bg-fg/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
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
                  className="flex flex-col gap-6 text-4xl font-semibold uppercase tracking-[0.3em] text-fg sm:text-5xl md:text-[clamp(3rem,6vw,4.5rem)]"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
                    },
                  }}
                  onMouseLeave={() => setVariant(initialVariantRef.current)}
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
                        <span className="text-sm font-normal tracking-[0.4em] text-fg/40">0{index + 1}</span>
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
                className="flex w-full flex-col gap-8 text-sm uppercase tracking-[0.35em] text-fg/60 md:w-64"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <div className="flex flex-col gap-2 text-xs tracking-[0.4em] text-fg/40">
                  <span>Social</span>
                  <div className="h-px w-16 bg-fg/20" />
                </div>
                <div className="flex flex-wrap gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.35em]">
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
