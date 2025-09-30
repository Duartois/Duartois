import clsx from "classnames";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

export function SunIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden
      focusable="false"
      className={clsx(
        "h-6 w-6 text-brand-500 drop-shadow-sm transition-transform duration-300 ease-pleasant",
        className,
      )}
      {...props}
    >
      <circle cx="12" cy="12" r="4.75" className="fill-current opacity-95" />
      <circle
        cx="12"
        cy="12"
        r="6.25"
        className="stroke-current opacity-35"
        strokeWidth="1.5"
        fill="none"
      />
      <g
        className="stroke-current opacity-70"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="2.5" x2="12" y2="5.2" />
        <line x1="12" y1="18.8" x2="12" y2="21.5" />
        <line x1="4.2" y1="12" x2="6.9" y2="12" />
        <line x1="17.1" y1="12" x2="19.8" y2="12" />
        <line x1="5.5" y1="5.5" x2="7.4" y2="7.4" />
        <line x1="16.6" y1="16.6" x2="18.5" y2="18.5" />
        <line x1="16.6" y1="7.4" x2="18.5" y2="5.5" />
        <line x1="5.5" y1="18.5" x2="7.4" y2="16.6" />
      </g>
      <circle cx="12" cy="12" r="2.75" className="fill-brand-100 opacity-90" />
    </svg>
  );
}

export function MoonIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden
      focusable="false"
      className={clsx(
        "h-6 w-6 text-accent3-200 drop-shadow-sm transition-transform duration-300 ease-pleasant",
        className,
      )}
      {...props}
    >
      <path
        className="fill-current"
        d="M16.84 4.22a.75.75 0 0 1 .91-.91 9.75 9.75 0 1 1-12.62 12.62.75.75 0 0 1 .91-.91 7.5 7.5 0 0 0 10.8-10.8Z"
      />
      <path
        className="fill-accent3-100/70"
        d="M14.1 6.35a5.25 5.25 0 0 0-4.67 7.52 5.25 5.25 0 0 1 7.59-7.59 5.23 5.23 0 0 0-2.92-.93Z"
      />
      <g className="fill-current opacity-80">
        <circle cx="6.75" cy="6.75" r="1" className="opacity-70" />
        <circle cx="18.25" cy="8.5" r="0.65" className="opacity-60" />
        <circle cx="9.5" cy="18" r="0.85" className="opacity-50" />
      </g>
    </svg>
  );
}
