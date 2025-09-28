"use client";

import { useFrame } from "@react-three/fiber";
import { MarchingCubes, MarchingPlane } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { Color } from "three";
import type { MarchingCubes as MarchingCubesImpl } from "three/examples/jsm/objects/MarchingCubes.js";

type Metaball = {
  color: Color;
  offset: number;
  radius: number;
  speed: number;
};

const pastelPalette = ["#fbcfe8", "#fde68a", "#bfdbfe", "#e9d5ff", "#c8f7dc"];

export default function Metaballs() {
  const marchingRef = useRef<MarchingCubesImpl | null>(null);
  const metaballs = useMemo<Metaball[]>(
    () =>
      pastelPalette.map((hex, index) => ({
        color: new Color(hex),
        offset: (index / pastelPalette.length) * Math.PI * 2,
        radius: 0.38 + index * 0.03,
        speed: 0.6 + index * 0.15,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const marching = marchingRef.current;
    if (!marching) return;

    marching.reset();
    const time = clock.getElapsedTime();

    metaballs.forEach((ball, index) => {
      const phase = time * ball.speed + ball.offset;
      const x = Math.sin(phase * 0.9 + index * 0.3) * 0.55;
      const y = Math.cos(phase * 1.1 + index * 0.45) * 0.55;
      const z = Math.sin(phase * 0.7 + index * 0.6) * 0.55;

      marching.addBall(x, y, z, ball.radius, 5, ball.color);
    });

    marching.update();
  });

  return (
    <MarchingCubes
      ref={marchingRef}
      resolution={32}
      maxPolyCount={12000}
      enableColors
    >
      <MarchingPlane planeType="z" />
      <meshStandardMaterial vertexColors roughness={0.35} metalness={0.15} />
    </MarchingCubes>
  );
}
