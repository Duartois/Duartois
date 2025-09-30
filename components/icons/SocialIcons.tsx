import type { SVGProps } from "react";

function createIcon(Component: (props: SVGProps<SVGSVGElement>) => JSX.Element) {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    const { width = 16, height = 16, ...rest } = props;
    return <Component width={width} height={height} {...rest} />;
  };
}

export const LinkedInIcon = createIcon(function LinkedInIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x={3} y={3} width={18} height={18} rx={4} stroke="currentColor" />
      <path d="M8.5 10.25v6.5" strokeLinecap="round" />
      <path d="M8.5 7.35h.01" strokeLinecap="round" />
      <path d="M12.75 16.75v-3.6a2.1 2.1 0 0 1 4.2 0v3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export const BehanceIcon = createIcon(function BehanceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x={3} y={3} width={18} height={18} rx={4} stroke="currentColor" />
      <path
        d="M8 7.75h2.25a2.5 2.5 0 0 1 0 5H8v-5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12.75h2.35a2.65 2.65 0 1 1-2.35 2.65V7.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.75 10.4h4.1" strokeLinecap="round" />
      <path
        d="M13.5 13.1a2.6 2.6 0 0 1 5.18.42v.3c0 1.67-1 2.9-2.6 2.9-1.42 0-2.58-.94-2.58-2.56"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

export const DribbbleIcon = createIcon(function DribbbleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x={3} y={3} width={18} height={18} rx={4} stroke="currentColor" />
      <circle cx={12} cy={12} r={5} stroke="currentColor" />
      <path d="M7.8 11.1c1.62-.15 3.34-.12 5.05.1" strokeLinecap="round" />
      <path d="M10.25 7.75c1.55 1.85 2.7 4.2 3.38 6.78" strokeLinecap="round" />
      <path d="M9.5 16.1c.55-2.16 1.76-3.7 4.7-3.94" strokeLinecap="round" />
    </svg>
  );
});

export const InstagramIcon = createIcon(function InstagramIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x={3} y={3} width={18} height={18} rx={5} stroke="currentColor" />
      <circle cx={12} cy={12} r={3.8} stroke="currentColor" />
      <path d="M16.2 7.8h.01" strokeLinecap="round" />
    </svg>
  );
});
