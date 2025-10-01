"use client";

import { motion, type SVGMotionProps } from "framer-motion";

type MenuToggleIconProps = {
  isOpen: boolean;
} & Omit<SVGMotionProps<SVGSVGElement>, "animate" | "initial">;

export default function MenuToggleIcon({ isOpen, className, ...rest }: MenuToggleIconProps) {
  const state = isOpen ? "open" : "closed";

  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      className={className}
      initial={false}
      animate={state}
      {...rest}
    >
      <motion.line
        x1={5}
        x2={19}
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        style={{ transformOrigin: "12px 12px" }}
        variants={{
          closed: { y1: 7, y2: 7, rotate: 0 },
          open: { y1: 12, y2: 12, rotate: 45 },
        }}
        transition={{ duration: 0.35, ease: [0.32, 0, 0.2, 1] }}
      />
      <motion.line
        x1={5}
        x2={19}
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        variants={{
          closed: { y1: 12, y2: 12, opacity: 1 },
          open: { y1: 12, y2: 12, opacity: 0 },
        }}
        transition={{ duration: 0.25, ease: [0.32, 0, 0.2, 1] }}
      />
      <motion.line
        x1={5}
        x2={19}
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        style={{ transformOrigin: "12px 12px" }}
        variants={{
          closed: { y1: 17, y2: 17, rotate: 0 },
          open: { y1: 12, y2: 12, rotate: -45 },
        }}
        transition={{ duration: 0.35, ease: [0.32, 0, 0.2, 1] }}
      />
    </motion.svg>
  );
}
