"use client";

import type { SVGProps } from "react";

export default function ArrowLaunchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6.5 13.5 13.2 6.8M13.2 6.8H7.2M13.2 6.8v6"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
