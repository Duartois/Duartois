"use client";

import clsx from "classnames";
import Link from "next/link";
import { type ButtonHTMLAttributes, type RefObject } from "react";

import LanguageSwitcher from "./LanguageSwitcher";
import MenuToggleIcon from "./MenuToggleIcon";
import ThemeToggle from "./ThemeToggle";

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
        <span className={variantStyles.brandPrefix}>Duartois/</span>
        <span className={variantStyles.brandSuffix}>Matheus Duarte</span>
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

const styles: Record<
  Variant,
  {
    container: string;
    brandLink: string;
    brandPrefix: string;
    brandSuffix: string;
    controlsContainer: string;
    switcherContainer: string;
    button: string;
    buttonIconWrapper: string;
    buttonIcon: string;
  }
> = {
  default: {
    container: "flex items-center justify-between gap-6",
    brandLink:
      "group inline-flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-fg transition duration-300 ease-out hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
    brandPrefix: "text-fg/60",
    brandSuffix: "text-fg",
    controlsContainer:
      "flex items-center justify-end gap-6 text-[0.75rem] font-medium uppercase tracking-[0.28em] text-fg/70",
    switcherContainer: "flex items-center gap-3",
    button:
      "group inline-flex items-center gap-2 rounded-md px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-fg transition duration-300 ease-out hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
    buttonIconWrapper: "inline-flex h-6 w-6 items-center justify-center text-current transition",
    buttonIcon: "h-4 w-4",
  },
  overlay: {
    container: "flex items-center justify-between gap-6",
    brandLink:
      "pointer-events-auto group inline-flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-fg transition duration-300 ease-out hover:text-brand-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200",
    brandPrefix: "text-fg/60",
    brandSuffix: "text-fg",
    controlsContainer:
      "pointer-events-auto flex items-center justify-end gap-6 text-[0.75rem] font-medium uppercase tracking-[0.28em] text-fg/70",
    switcherContainer: "flex items-center gap-3",
    button:
      "group inline-flex items-center gap-2 rounded-md px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-fg transition duration-300 ease-out hover:text-brand-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200",
    buttonIconWrapper: "inline-flex h-6 w-6 items-center justify-center text-current transition",
    buttonIcon: "h-4 w-4",
  },
};
