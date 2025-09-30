import clsx from "classnames";
import type { PropsWithChildren } from "react";

type WaveUnderlineProps = PropsWithChildren<{
  className?: string;
  underlineClassName?: string;
}>;

const waveBackground =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 12'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='3' d='M0 6c10-8 20 8 30 0s20-8 30 0 20 8 30 0 20-8 30 0'/%3E%3C/svg%3E\")";

export function WaveUnderline({
  children,
  className,
  underlineClassName,
}: WaveUnderlineProps) {
  return (
    <span className={clsx("relative inline-flex flex-col", className)}>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className={clsx("mt-2 h-2 overflow-hidden text-brand-400", underlineClassName)}
      >
        <span
          className="block h-full w-full bg-repeat-x bg-[length:7.5rem_0.75rem] animate-wave"
          style={{ backgroundImage: waveBackground }}
        />
      </span>
    </span>
  );
}
