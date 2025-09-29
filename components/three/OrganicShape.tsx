"use client";

import { useFrame } from "@react-three/fiber";
import { MarchingCubes } from "@react-three/drei";
import { useMemo, useRef } from "react";
import {
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  TorusKnotGeometry,
} from "three";
import type { MarchingCubes as MarchingCubesImpl } from "three/examples/jsm/objects/MarchingCubes.js";

const pastelColorSchemes = {
  aurora: {
    gradient: ["#bde4f4", "#fbc6ff", "#ffe5b4"],
    emissive: "#c7f0d8",
  },
  blossom: {
    gradient: ["#f9c5d1", "#fde6c8", "#d9f5ff"],
    emissive: "#ffe3f1",
  },
  lagoon: {
    gradient: ["#b7f0e4", "#cfe7ff", "#e4d3ff"],
    emissive: "#b3e5c9",
  },
  brand: {
    gradient: ["#cdd7ff", "#f2c7ff", "#ffe6cc"],
    emissive: "#c7d1ff",
  },
} as const;

type OrganicVariant = "marchingCubes" | "torusKnot" | "hero";

type PastelSchemeName = keyof typeof pastelColorSchemes;

type OrganicShapeProps = {
  variant?: OrganicVariant;
  colorScheme?: PastelSchemeName;
};

type Metaball = {
  color: Color;
  offset: number;
  radius: number;
  speed: number;
};

export default function OrganicShape({
  variant = "marchingCubes",
  colorScheme = "aurora",
}: OrganicShapeProps) {
  const scheme = pastelColorSchemes[colorScheme] ?? pastelColorSchemes.aurora;

  const resolvedVariant = variant === "hero" ? "marchingCubes" : variant;
  const isHero = variant === "hero";

  const gradientColors = useMemo(
    () => scheme.gradient.map((hex) => new Color(hex)),
    [scheme],
  );
  const emissiveColor = useMemo(() => new Color(scheme.emissive), [scheme]);

  const marchingRef = useRef<MarchingCubesImpl | null>(null);
  const groupRef = useRef<Group | null>(null);
  const torusRef = useRef<Mesh<TorusKnotGeometry, MeshStandardMaterial> | null>(
    null,
  );
  const materialRef = useRef<MeshStandardMaterial | null>(null);

  const metaballs = useMemo<Metaball[]>(() => {
    if (resolvedVariant !== "marchingCubes") {
      return [];
    }

    return gradientColors.map((color, index) => ({
      color,
      offset: (index / gradientColors.length) * Math.PI * 2,
      radius: (isHero ? 0.38 : 0.32) + index * (isHero ? 0.065 : 0.05),
      speed: (isHero ? 0.65 : 0.55) + index * (isHero ? 0.24 : 0.2),
    }));
  }, [gradientColors, isHero, resolvedVariant]);

  const tempColor = useMemo(() => new Color(), []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (resolvedVariant === "marchingCubes") {
      const marching = marchingRef.current;
      if (marching) {
        marching.reset();

        metaballs.forEach((ball, index) => {
          const phase = time * ball.speed + ball.offset;
          const x = Math.sin(phase * 0.9 + index * 0.3) * 0.55;
          const y = Math.cos(phase * 1.1 + index * 0.45) * 0.55;
          const z = Math.sin(phase * 0.7 + index * 0.6) * 0.55;

          const strength = isHero ? 6 : 5;
          marching.addBall(x, y, z, ball.radius, strength, ball.color);
        });

        marching.update();
      }
    }

    if (variant === "hero") {
      const group = groupRef.current;
      if (group) {
        group.rotation.x = Math.sin(time * 0.25) * 0.18;
        group.rotation.y = time * 0.22;
        group.rotation.z = Math.sin(time * 0.18) * 0.12;
      }
    }

    if (resolvedVariant === "torusKnot") {
      const torus = torusRef.current;
      const material = materialRef.current;
      if (torus && material) {
        torus.rotation.x = time * 0.35;
        torus.rotation.y = time * 0.45;
        torus.rotation.z = Math.sin(time * 0.2) * 0.25;

        const scale = 1 + Math.sin(time * 0.85) * 0.06;
        torus.scale.setScalar(scale);

        const gradientFactor = (Math.sin(time * 0.6) + 1) / 2;
        tempColor.copy(gradientColors[0]).lerp(gradientColors[1] ?? gradientColors[0], gradientFactor);
        material.color.copy(tempColor);

        const emissivePulse = 0.45 + Math.sin(time * 1.1) * 0.25;
        material.emissive.copy(emissiveColor).multiplyScalar(emissivePulse);
      }
    }
  });

  if (resolvedVariant === "torusKnot") {
    return (
      <mesh ref={torusRef} castShadow receiveShadow>
        <torusKnotGeometry args={[0.95, 0.32, 256, 32, 2, 5]} />
        <meshStandardMaterial
          ref={materialRef}
          roughness={0.38}
          metalness={0.12}
          envMapIntensity={0.8}
          emissiveIntensity={0.65}
          toneMapped={false}
        />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <MarchingCubes
        ref={marchingRef}
        resolution={isHero ? 40 : 32}
        maxPolyCount={12000}
        enableColors
      >
        <meshStandardMaterial
          vertexColors
          roughness={0.3}
          metalness={0.1}
          emissive={emissiveColor}
          emissiveIntensity={isHero ? 0.65 : 0.5}
          envMapIntensity={0.7}
          toneMapped={false}
        />
      </MarchingCubes>
    </group>
  );
}
