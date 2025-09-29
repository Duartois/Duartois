"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { Group } from "three";

import ProceduralShapes from "./ProceduralShapes";
import { variantMapping } from "../../store/variants";

function AvatarShowcase({ reduceMotion }: { reduceMotion: boolean }) {
  const rootRef = useRef<Group | null>(null);
  const orbitRef = useRef<Group | null>(null);

  const avatarVariant = useMemo(() => variantMapping.avatar, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    const root = rootRef.current;
    if (root) {
      const pulse = reduceMotion ? 1 : 1 + Math.sin(time * 1.1) * 0.05;
      root.scale.setScalar(pulse);

      if (!reduceMotion) {
        root.rotation.x = Math.sin(time * 0.35) * 0.22;
        root.rotation.y = time * 0.25;
        root.rotation.z = Math.sin(time * 0.18) * 0.15;
      }
    }

    const orbit = orbitRef.current;
    if (orbit) {
      if (reduceMotion) {
        orbit.rotation.set(0.2, 0.4, 0);
      } else {
        orbit.rotation.y = time * 0.6;
        orbit.rotation.x = Math.sin(time * 0.45) * 0.25;
        orbit.rotation.z = Math.cos(time * 0.3) * 0.18;
      }
    }
  });

  return (
    <group ref={rootRef}>
      <group ref={orbitRef}>
        <ProceduralShapes variantOverride={avatarVariant} parallax={false} />
      </group>
    </group>
  );
}

export default function AvatarOrb() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative h-80 w-80 overflow-hidden rounded-full border border-fg/20 bg-gradient-to-br from-fg/10 via-transparent to-transparent shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 8]} intensity={1.2} />
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-full bg-fg/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-fg/70 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]">
                Loading avatar…
              </div>
            </Html>
          }
        >
          <AvatarShowcase reduceMotion={Boolean(shouldReduceMotion)} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-transparent to-bg/20" aria-hidden />
    </div>
  );
}
