"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { Color, Group, Mesh } from "three";

function OrbitingSpark({
  radius,
  speed,
  delay,
  reduceMotion,
}: {
  radius: number;
  speed: number;
  delay: number;
  reduceMotion: boolean;
}) {
  const groupRef = useRef<Group | null>(null);
  const sparkRef = useRef<Mesh | null>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    const group = groupRef.current;
    if (group && !reduceMotion) {
      const t = time * speed + delay;
      group.rotation.y = t;
      group.rotation.x = Math.sin(t * 0.6) * 0.35;
    }

    const spark = sparkRef.current;
    if (spark) {
      spark.position.set(radius, 0, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={sparkRef}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          color="#f5f2ff"
          emissive="#86a4ff"
          emissiveIntensity={0.8}
          metalness={0.25}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function AvatarCore({ reduceMotion }: { reduceMotion: boolean }) {
  const shellRef = useRef<Mesh | null>(null);
  const coreRef = useRef<Mesh | null>(null);

  const colors = useMemo(
    () => ({
      core: new Color("#f2d4ff"),
      coreEmissive: new Color("#7289ff"),
      shell: new Color("#95c8ff"),
      shellEmissive: new Color("#70a2ff"),
    }),
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (!reduceMotion) {
      const shell = shellRef.current;
      if (shell) {
        shell.rotation.x = Math.sin(time * 0.35) * 0.4;
        shell.rotation.y = time * 0.45;
        shell.rotation.z = Math.sin(time * 0.25) * 0.3;
      }

      const core = coreRef.current;
      if (core) {
        core.rotation.x = Math.cos(time * 0.4) * 0.25;
        core.rotation.y = time * 0.35;
        core.rotation.z = Math.sin(time * 0.45) * 0.2;
      }
    }
  });

  return (
    <group>
      <mesh ref={shellRef} castShadow receiveShadow>
        <icosahedronGeometry args={[1.4, 2]} />
        <meshStandardMaterial
          color={colors.shell}
          emissive={colors.shellEmissive}
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.15}
          transparent
          opacity={0.75}
          envMapIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={coreRef} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={colors.core}
          emissive={colors.coreEmissive}
          emissiveIntensity={0.42}
          roughness={0.28}
          metalness={0.18}
          envMapIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
      <OrbitingSpark radius={1.9} speed={0.6} delay={0} reduceMotion={reduceMotion} />
      <OrbitingSpark radius={1.9} speed={-0.45} delay={Math.PI / 2} reduceMotion={reduceMotion} />
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
          <AvatarCore reduceMotion={Boolean(shouldReduceMotion)} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-transparent to-bg/20" aria-hidden />
    </div>
  );
}
