"use client";

import clsx from "classnames";
import { type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";

const defaultElement = "span" satisfies ElementType;

const hoverClassByTrigger = {
  group: {
    translate: "group-hover:-translate-y-1 group-focus-visible:-translate-y-1",
    scale: "group-hover:scale-x-100 group-focus-visible:scale-x-100",
  },
  self: {
    translate: "hover:-translate-y-1 focus-visible:-translate-y-1",
    scale: "hover:scale-x-100 focus-visible:scale-x-100",
  },
  none: {
    translate: "",
    scale: "",
  },
} as const;

export type AnimatedTextProps<T extends ElementType = typeof defaultElement> = {
  as?: T;
  children: ReactNode;
  /**
   * Controls whether the underline indicator is rendered.
   * Defaults to `true` to match the navigation treatment.
   */
  underline?: boolean;
  /**
   * Determines which element controls the hover/focus animation.
   * Use `group` (default) when the component lives inside a parent with the
   * `group` class, or `self` when the component itself handles interactions.
   */
  trigger?: "group" | "self" | "none";
  innerClassName?: string;
  underlineClassName?: string;
  textClassName?: string;
};

type PolymorphicProps<T extends ElementType> = AnimatedTextProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof AnimatedTextProps<T>>;

type AnimatedTextComponent = <T extends ElementType = typeof defaultElement>(
  props: PolymorphicProps<T>,
) => JSX.Element;

const AnimatedText: AnimatedTextComponent = ({
  as,
  children,
  className,
  underline = true,
  trigger = "group",
  innerClassName,
  underlineClassName,
  textClassName,
  ...rest
}) => {
  const Component = (as ?? defaultElement) as ElementType;
  const hoverClasses = hoverClassByTrigger[trigger];

  return (
    <Component
      {...rest}
      className={clsx(
        "relative inline-block overflow-hidden align-baseline",
        className,
      )}
    >
      <span
        className={clsx(
          "relative block",
          "motion-reduce:transition-none motion-reduce:[transform:translateY(0)!important]",
          innerClassName,
        )}
      >
        <span
          className={clsx(
            "block translate-y-0 transition-transform duration-300 ease-out",
            hoverClasses.translate,
            "motion-reduce:transition-none motion-reduce:[transform:translateY(0)!important]",
            textClassName,
          )}
        >
          {children}
        </span>
        {underline && (
          <span
            aria-hidden
            className={clsx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current",
              "transition-transform duration-300 ease-out",
              hoverClasses.scale,
              "motion-reduce:scale-x-100 motion-reduce:transition-none",
              underlineClassName,
            )}
          />
        )}
      </span>
    </Component>
  );
};

export default AnimatedText;
