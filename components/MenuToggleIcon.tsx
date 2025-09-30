"use client";

import { motion, type SVGMotionProps } from "framer-motion";

type MenuToggleIconProps = {
  isOpen: boolean;
} & Omit<SVGMotionProps<SVGSVGElement>, "animate" | "initial">;

const transition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1] as const,
};

export default function MenuToggleIcon({ isOpen, className, ...rest }: MenuToggleIconProps) {
  const composedClassName = ["relative", className].filter(Boolean).join(" ");
  const state = isOpen ? "open" : "closed";

  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      className={composedClassName}
      initial={false}
      animate={state}
      {...rest}
    >
      <motion.path
        variants={{
          closed: {
            d: "M5 7.5h14",
          },
          open: {
            d: "M6.2 6.2l11.6 11.6",
          },
        }}
        transition={transition}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <motion.path
        variants={{
          closed: {
            opacity: 1,
            d: "M5 12h14",
          },
          open: {
            opacity: 0,
            d: "M12 12h0",
          },
        }}
        transition={transition}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <motion.path
        variants={{
          closed: {
            d: "M5 16.5h14",
          },
          open: {
            d: "M17.8 6.2L6.2 17.8",
          },
        }}
        transition={transition}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
