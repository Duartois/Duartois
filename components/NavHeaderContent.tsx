"use client";

import clsx from "classnames";
import Link from "next/link";
import { type ButtonHTMLAttributes, type RefObject } from "react";

import LanguageSwitcher from "./LanguageSwitcher";
import MenuToggleIcon from "./MenuToggleIcon";
import ThemeToggle from "./ThemeToggle";
import SharleeMonogramIcon from "./icons/SharleeMonogram";
import SharleeMonogram from "./SharleeMonogram";

type Variant = "default" | "overlay";

type NavHeaderContentProps = {
  variant?: Variant;
  isOpen: boolean;
  onToggle: () => void;
  triggerRef?: RefObject<HTMLButtonElement>;
  labels: {
    open: string;
    close: string;
  };
  brandHref?: string;
  onBrandClick?: () => void;
  buttonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;
};

export default function NavHeaderContent({
  variant = "default",
  isOpen,
  onToggle,
  triggerRef,
  labels,
  brandHref = "/",
  onBrandClick,
  buttonProps,
}: NavHeaderContentProps) {
  const variantStyles = styles[variant];
  const { className: buttonClassName, ...restButtonProps } = buttonProps ?? {};

  return (
    <div className={variantStyles.container}>
      <Link
        href={brandHref}
        aria-label="Sharlee Studio"
        onClick={onBrandClick}
        className={variantStyles.brandLink}
      >
        {variant === "overlay" ? (
          <span className={variantStyles.brandInner}>
            <SharleeMonogramIcon aria-hidden />
          </span>
        ) : (
          <>
            <SharleeMonogramIcon
              className="text-fg transition duration-300 ease-out group-hover:scale-[1.02]"
              aria-hidden
            />
            <SharleeMonogram className="h-12 w-12 text-fg transition duration-300 ease-out group-hover:scale-[1.02]" />
          </>
        )}
      </Link>

      <div className={variantStyles.controlsContainer}>
        <div className={variantStyles.switcherContainer}>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <button
          ref={triggerRef}
          type="button"
          onClick={onToggle}
          {...restButtonProps}
          className={clsx(variantStyles.button, buttonClassName)}
        >
          <span>{isOpen ? labels.close : labels.open}</span>
          <span className={variantStyles.buttonIconWrapper}>
            <MenuToggleIcon
              aria-hidden="true"
              isOpen={isOpen}
              className={variantStyles.buttonIcon}
            />
          </span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<Variant, {
  container: string;
  brandLink: string;
  brandInner?: string;
  controlsContainer: string;
  switcherContainer: string;
  button: string;
  buttonIconWrapper: string;
  buttonIcon: string;
}> = {
  default: {
    container: "flex items-start justify-between gap-6",
    brandLink:
      "group inline-flex items-center rounded-full border border-fg/10 bg-white/70 px-3 py-2 shadow-soft backdrop-blur transition hover:border-fg/30 hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg",
    controlsContainer: "flex flex-col items-end gap-3",
    switcherContainer: "flex items-center gap-2 text-right",
    button:
      "group relative flex items-center gap-3 rounded-full border border-fg/15 bg-white/70 px-4 py-2 text-sm font-medium uppercase tracking-[0.32em] text-fg/80 shadow-[0_10px_30px_-18px_rgba(18,23,35,0.35)] backdrop-blur transition duration-300 ease-out hover:-translate-y-0.5 hover:border-fg/40 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg",
    buttonIconWrapper:
      "flex h-10 w-10 items-center justify-center rounded-full bg-fg/10 transition duration-300 ease-out group-hover:bg-fg/20",
    buttonIcon: "h-5 w-5 text-fg transition duration-300 ease-out",
  },
  overlay: {
    container: "flex items-start justify-between gap-6",
    brandLink:
      "pointer-events-auto inline-flex items-center rounded-full border border-fg/10 bg-white/70 px-4 py-2 text-[0.65rem] uppercase tracking-[0.32em] text-fg/70 shadow-soft backdrop-blur transition hover:border-fg/30 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg",
    brandInner:
      "inline-flex items-center rounded-full border border-fg/10 bg-white/70 px-3 py-2 shadow-soft backdrop-blur transition hover:border-fg/30 hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg",
    controlsContainer:
      "pointer-events-auto flex flex-col items-end gap-3 text-[0.65rem] uppercase tracking-[0.32em] text-fg/60",
    switcherContainer: "flex items-center gap-2",
    button:
      "group flex items-center gap-3 rounded-full border border-fg/12 bg-white/70 px-6 py-2 text-[0.65rem] font-medium tracking-[0.28em] text-fg/80 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:border-fg/40 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg",
    buttonIconWrapper:
      "flex h-10 w-10 items-center justify-center rounded-full bg-fg/10 text-fg transition duration-300 ease-out group-hover:bg-fg group-hover:text-bg",
    buttonIcon: "h-5 w-5",
  },
};
