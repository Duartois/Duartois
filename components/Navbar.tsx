"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/app/i18n/config";

import NavHeaderContent from "./NavHeaderContent";
import NavOverlay from "./NavOverlay";

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
      <div className="fixed inset-x-0 top-5 z-50 px-6 md:px-10">
        <NavHeaderContent
          isOpen={isOpen}
          onToggle={() => setIsOpen((open) => !open)}
          triggerRef={triggerRef}
          labels={{ open: t("navbar.open"), close: t("navbar.close") }}
          buttonProps={{
            "aria-haspopup": "dialog",
            "aria-expanded": isOpen,
            "aria-controls": "main-navigation-overlay",
          }}
        />
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
