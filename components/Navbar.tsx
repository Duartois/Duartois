"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/app/i18n/client";
import LanguageSwitcher from "./LanguageSwitcher";

const MetaballsCanvas = dynamic(() => import("./three/MetaballsCanvas"), {
  ssr: false,
  loading: () => <div className="h-48 w-48 animate-pulse rounded-full bg-fg/10" />,
});

const navigationLinks = [
  { key: "navbar.links.home", href: "/" },
  { key: "navbar.links.work", href: "/work" },
  { key: "navbar.links.about", href: "/about" },
  { key: "navbar.links.contact", href: "/contact" },
] as const;

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/duartois" },
  { label: "Behance", href: "https://www.behance.net/duartois" },
  { label: "Dribbble", href: "https://dribbble.com/duartois" },
  { label: "Instagram", href: "https://www.instagram.com/duartois" },
] as const;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const hasOpenedRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      firstLinkRef.current?.focus();
      document.body.classList.add("overflow-hidden");
      hasOpenedRef.current = true;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.classList.remove("overflow-hidden");
      };
    }

    document.body.classList.remove("overflow-hidden");
    if (hasOpenedRef.current) {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="main-navigation-overlay"
        className="group fixed right-6 top-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-fg/20 bg-bg/80 text-fg shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-fg/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
      >
        <span className="sr-only">
          {isOpen ? t("navbar.closeNavigation") : t("navbar.openNavigation")}
        </span>
        <span aria-hidden="true" className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, index) => (
            <motion.span
              key={index}
              layout
              className="h-1.5 w-1.5 rounded-full bg-fg transition group-hover:scale-110 group-focus-visible:scale-110"
              animate={
                isOpen
                  ? {
                      scale: 0.6,
                      opacity: 0.35,
                    }
                  : {
                      scale: 1,
                      opacity: 1,
                    }
              }
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          ))}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
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
              className="absolute inset-0 bg-gradient-to-br from-[#05060f] via-[#070b1f]/95 to-[#010106]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
            <div className="pointer-events-none absolute inset-0 opacity-50">
              <Suspense fallback={null}>
                <div className="absolute left-1/2 top-1/2 h-[min(70vh,36rem)] w-[min(70vh,36rem)] -translate-x-1/2 -translate-y-1/2">
                  <MetaballsCanvas />
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
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-full bg-fg/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-fg transition hover:bg-fg/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  {t("navbar.close")}
                </motion.button>
              </header>

              <div className="flex flex-1 flex-col justify-end gap-16 px-6 pb-12 text-left md:flex-row md:items-end md:justify-between md:px-12 md:pb-16">
                <nav aria-label="Primary" className="w-full md:w-auto">
                  <motion.ul
                    className="flex flex-col gap-6 text-4xl font-semibold uppercase tracking-[0.3em] text-fg sm:text-5xl md:text-[clamp(3rem,6vw,4.5rem)]"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
                      },
                    }}
                  >
                    {navigationLinks.map(({ key, href }, index) => (
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
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-6 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg"
                        >
                          <span className="text-sm font-normal tracking-[0.4em] text-fg/40">0{index + 1}</span>
                          <span className="relative">
                          <span className="block transition duration-300 ease-out group-hover:-translate-y-1">
                            {t(key)}
                          </span>
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
                    <span>{t("navbar.social")}</span>
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
                  <LanguageSwitcher />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
