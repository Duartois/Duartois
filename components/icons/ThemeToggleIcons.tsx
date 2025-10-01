import clsx from "classnames";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

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
        d="M20.3 14.35a8.25 8.25 0 1 1-10.65-10.6A6.75 6.75 0 0 0 20.3 14.35Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90"
      />
      <path
        d="M13.8 4.85a6.05 6.05 0 0 0-.5 8.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
      <g className="fill-current opacity-80">
        <circle cx="7.1" cy="7.1" r="0.9" className="opacity-70" />
        <circle cx="17.8" cy="8.85" r="0.6" className="opacity-60" />
        <circle cx="10.2" cy="17.6" r="0.8" className="opacity-50" />
      </g>
    </svg>
  );
}
