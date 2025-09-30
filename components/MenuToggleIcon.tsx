"use client";

import { motion, type SVGMotionProps } from "framer-motion";

type MenuToggleIconProps = {
  isOpen: boolean;
} & Omit<SVGMotionProps<SVGSVGElement>, "animate" | "initial">;

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
      <motion.circle
        cx={12}
        cy={12}
        r={9.5}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.5}
        strokeOpacity={0.22}
        variants={{
          closed: { scale: 1, opacity: 0.55 },
          open: { scale: 1.05, opacity: 0.35 },
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.path
        variants={{
          closed: {
            d: "M5.5 8c1.9-.8 4.1-1.2 6.5-1.2s4.6.4 6.5 1.2",
            rotate: 0,
          },
          open: {
            d: "M6.2 6.2l11.6 11.6",
            rotate: 2,
          },
        }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        stroke="currentColor"
        strokeWidth={1.6}
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
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <motion.path
        variants={{
          closed: {
            d: "M18.5 16c-1.9.8-4.1 1.2-6.5 1.2s-4.6-.4-6.5-1.2",
            rotate: 0,
          },
          open: {
            d: "M17.8 6.2L6.2 17.8",
            rotate: -2,
          },
        }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
