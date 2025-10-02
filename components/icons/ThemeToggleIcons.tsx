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
        "h-6 w-6 text-spring drop-shadow-sm transition-transform duration-300 ease-pleasant",
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
export function SunIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden
      focusable="false"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      className={clsx(
        "h-6 w-6 text-flamingo drop-shadow-sm transition-transform duration-300 ease-pleasant",
        className
      )}
      {...props}
    >
      <path d="M12 3v2.25" className="opacity-90" />
      <path d="M12 18.75V21" className="opacity-90" />
      <path d="M21 12h-2.25" className="opacity-90" />
      <path d="M3 12h2.25" className="opacity-90" />
      <path d="M16.77 7.23L14.65 9.35" className="opacity-90" />
      <path d="M14.65 14.65L16.77 16.77" className="opacity-90" />
      <path d="M7.23 16.77L9.35 14.65" className="opacity-90" />
      <path d="M9.35 9.35L7.23 7.23" className="opacity-90" />
      <circle cx="12" cy="12" r="3.75" className="opacity-90" />
    </svg>
  );
}
