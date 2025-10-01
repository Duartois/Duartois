"use client";

import type { CSSProperties, SVGProps } from "react";

type MenuToggleIconProps = {
  isOpen: boolean;
} & Omit<SVGProps<SVGSVGElement>, "children">;

const circleDefinitions = [
  {
    cx: 12,
    cy: 12,
    openTransform: "translateX(-24px) translateY(-24px)",
  },
  {
    cx: 24,
    cy: 12,
    openTransform: "translateX(0px) translateY(-24px)",
  },
  {
    cx: 36,
    cy: 12,
    openTransform: "translateX(24px) translateY(-24px)",
  },
  {
    cx: 36,
    cy: 24,
    openTransform: "translateX(24px) translateY(0px)",
  },
  {
    cx: 36,
    cy: 36,
    openTransform: "translateX(24px) translateY(24px)",
  },
  {
    cx: 24,
    cy: 36,
    openTransform: "translateX(0px) translateY(24px)",
  },
  {
    cx: 12,
    cy: 36,
    openTransform: "translateX(-24px) translateY(24px)",
  },
  {
    cx: 12,
    cy: 24,
    openTransform: "translateX(-24px) translateY(0px)",
  },
];

const rectangleDefinitions = [
  {
    x: 21,
    y: 21,
    width: 39.94,
    height: 6,
    rx: 3,
    ry: 3,
    openTransform: "translateX(-16.97px) translateY(0px)",
    scaleAxis: "X" as const,
  },
  {
    x: 21,
    y: 21,
    width: 6,
    height: 39.94,
    rx: 3,
    ry: 3,
    openTransform: "translateX(0px) translateY(-16.97px)",
    scaleAxis: "Y" as const,
  },
];

export default function MenuToggleIcon({
  className,
  isOpen,
  ...rest
}: MenuToggleIconProps) {
  const { style, ...svgProps } = rest;

  const baseTransform = isOpen ? "rotate(45deg)" : "rotate(0deg)";
  const svgStyle: CSSProperties = {
    transition: "transform 300ms ease",
    transformOrigin: "50% 50%",
    ...style,
    transform: style?.transform
      ? `${style.transform} ${baseTransform}`
      : baseTransform,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={32}
      height={32}
      className={className}
      aria-hidden="true"
      style={svgStyle}
      {...svgProps}
    >
      <title>Menu</title>
      {circleDefinitions.map(({ cx, cy, openTransform }, index) => (
        <circle
          // eslint-disable-next-line react/no-array-index-key
          key={`circle-${index}`}
          cx={cx}
          cy={cy}
          r={3}
          opacity={isOpen ? 0 : 1}
          style={{
            transform: isOpen
              ? openTransform
              : "translateX(0px) translateY(0px)",
            transformOrigin: "0px 0px",
            transition: "transform 300ms ease, opacity 200ms ease",
          }}
        />
      ))}
      {rectangleDefinitions.map(
        ({ x, y, width, height, rx, ry, openTransform, scaleAxis }, index) => (
          <rect
            // eslint-disable-next-line react/no-array-index-key
            key={`rect-${index}`}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={rx}
            ry={ry}
            opacity={isOpen ? 1 : 0}
            style={{
              transform: `${openTransform} scale${scaleAxis}(${isOpen ? 1 : 0})`,
              transformOrigin: "24px 24px",
              transition: "transform 300ms ease, opacity 200ms ease",
            }}
          />
        ),
      )}
    </svg>
  );
}
