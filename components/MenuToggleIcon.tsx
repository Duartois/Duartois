"use client";

import type { SVGProps } from "react";

type MenuToggleIconProps = {
  isOpen: boolean;
} & Omit<SVGProps<SVGSVGElement>, "children">;

export default function MenuToggleIcon({
  className,
  isOpen: _isOpen,
  ...rest
}: MenuToggleIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={32}
      height={32}
      className={className}
      {...rest}
    >
      <title>Menu</title>
      <circle
        cx={12}
        cy={12}
        r={3}
        opacity={0}
        style={{
          transform: "translateX(-24px) translateY(-24px)",
          transformOrigin: "0px 0px",
        }}
      />
      <circle
        cx={24}
        cy={12}
        r={3}
        opacity={0}
        style={{
          transform: "translateX(0px) translateY(-24px)",
          transformOrigin: "0px 0px",
        }}
      />
      <circle
        cx={36}
        cy={12}
        r={3}
        opacity={0}
        style={{
          transform: "translateX(24px) translateY(-24px)",
          transformOrigin: "0px 0px",
        }}
      />
      <circle
        cx={36}
        cy={24}
        r={3}
        opacity={0}
        style={{
          transform: "translateX(24px) translateY(0px)",
          transformOrigin: "0px 0px",
        }}
      />
      <circle
        cx={36}
        cy={36}
        r={3}
        opacity={0}
        style={{
          transform: "translateX(24px) translateY(24px)",
          transformOrigin: "0px 0px",
        }}
      />
      <circle
        cx={24}
        cy={36}
        r={3}
        opacity={0}
        style={{
          transform: "translateX(0px) translateY(24px)",
          transformOrigin: "0px 0px",
        }}
      />
      <circle
        cx={12}
        cy={36}
        r={3}
        opacity={0}
        style={{
          transform: "translateX(-24px) translateY(24px)",
          transformOrigin: "0px 0px",
        }}
      />
      <circle
        cx={12}
        cy={24}
        r={3}
        opacity={0}
        style={{
          transform: "translateX(-24px) translateY(0px)",
          transformOrigin: "0px 0px",
        }}
      />
      <rect
        x={21}
        y={21}
        width={39.94}
        height={6}
        rx={3}
        ry={3}
        opacity={1}
        style={{
          transform: "translateX(-16.97px) translateY(0px)",
          transformOrigin: "0px 0px",
        }}
      />
      <rect
        x={21}
        y={21}
        width={6}
        height={39.94}
        rx={3}
        ry={3}
        opacity={1}
        style={{
          transform: "translateX(0px) translateY(-16.97px)",
          transformOrigin: "0px 0px",
        }}
      />
    </svg>
  );
}
