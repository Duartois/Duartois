"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

import LanguageSwitcher from "./LanguageSwitcher";
import MenuToggleIcon from "./MenuToggleIcon";
import NavOverlay from "./NavOverlay";
import ThemeToggle from "./ThemeToggle";

const navigationLinks = [
  { name: "home", href: "/" },
  { name: "work", href: "/work" },
  { name: "about", href: "/about" },
  { name: "contact", href: "/contact" },
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
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hasOpenedRef = useRef(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    if (isOpen) {
      firstLinkRef.current?.focus();
      document.body.classList.add("overflow-hidden");
      hasOpenedRef.current = true;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
          return;
        }

        if (event.key === "Tab") {
          const overlayElement = overlayRef.current;
          if (!overlayElement) {
            return;
          }

          const focusable = overlayElement.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea',
          );

          if (focusable.length === 0) {
            return;
          }

          const firstElement = focusable[0];
          const lastElement = focusable[focusable.length - 1];

          if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }

          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
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
      <div className="fixed inset-x-0 top-6 z-50 px-6">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-bg/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-fg/80 transition hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            <span className="text-fg">DD</span>
            <span className="hidden text-xs sm:inline">Duartois Design</span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              aria-controls="main-navigation-overlay"
              className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-fg/15 bg-bg/80 text-fg shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur transition-colors duration-300 hover:border-fg/40 hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
            >
              <span className="sr-only">{isOpen ? t("navbar.close") : t("navbar.open")}</span>
              <MenuToggleIcon
                aria-hidden="true"
                isOpen={isOpen}
                className="h-6 w-6 text-fg transition-colors duration-300 group-hover:text-fg group-focus-visible:text-fg"
              />
            </button>
          </div>
        </div>
      </div>

      <NavOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        firstLinkRef={firstLinkRef}
        navigationLinks={navigationLinks}
        socialLinks={socialLinks}
        overlayRef={overlayRef}
      />
    </>
  );
}
