import { type SVGProps } from "react";

/**
 * Duartois studio monogram used across favicons and meta previews.
 * The mark blends the initials "D" and "T" in a geometric grid that
 * mirrors the motion graphics present in the hero canvas.
 */
export default function DuartoisMonogram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient
          id="duartoisOuterGlow"
          x1="8"
          y1="6"
          x2="56"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#0D1B2A" />
          <stop offset="0.5" stopColor="#1B2A41" />
          <stop offset="1" stopColor="#3F5B85" />
        </linearGradient>
        <linearGradient
          id="duartoisAccent"
          x1="18"
          y1="14"
          x2="50"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#5DF2FF" />
          <stop offset="1" stopColor="#4C7DFF" />
        </linearGradient>
      </defs>

      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="18"
        fill="#0B1120"
        stroke="url(#duartoisOuterGlow)"
        strokeWidth="2"
      />
      <rect
        x="8.5"
        y="8.5"
        width="47"
        height="47"
        rx="14"
        stroke="#5DF2FF"
        strokeOpacity="0.22"
      />

      <path
        d="M20 18h12.5c7.18 0 13 5.82 13 13s-5.82 13-13 13H26"
        stroke="url(#duartoisAccent)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 18v28"
        stroke="#A8B7FF"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <circle cx="44" cy="22" r="3" fill="#5DF2FF" />
      <circle cx="22" cy="44" r="3" fill="#4C7DFF" />
    </svg>
  );
}
