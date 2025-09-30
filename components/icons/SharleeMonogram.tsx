"use client";

import type { SVGProps } from "react";

export default function SharleeMonogram({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <span className={className}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" {...props}>
        <defs>
          <linearGradient id="sharleeMonogramBg" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F1E8FF" />
            <stop offset="0.52" stopColor="#FCE5F6" />
            <stop offset="1" stopColor="#E9F7FF" />
          </linearGradient>
          <linearGradient id="sharleeMonogramStroke" x1="20" y1="12" x2="44" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6741D9" />
            <stop offset="1" stopColor="#0FA3B1" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#sharleeMonogramBg)" />
        <rect x="2" y="2" width="60" height="60" rx="18" stroke="rgba(27, 30, 36, 0.08)" strokeWidth="2" />
        <path
          d="M42 16h-9.5a8.5 8.5 0 0 0 0 17h6a9.5 9.5 0 1 1 0 19h-9.5a9.5 9.5 0 0 1-9.5-9.5"
          stroke="url(#sharleeMonogramStroke)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="17" r="3" fill="#6741D9" fillOpacity="0.9" />
        <circle cx="32" cy="47" r="3" fill="#0FA3B1" fillOpacity="0.85" />
      </svg>
    </span>
  );
}
