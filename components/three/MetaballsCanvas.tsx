"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import Metaballs from "./Metaballs";

export default function MetaballsCanvas() {
  return (
    <Canvas
      className="h-48 w-48"
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={["#fef9ff"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <Float
        rotationIntensity={0.25}
        floatIntensity={0.6}
        speed={1}
        floatingRange={[-0.1, 0.1]}
      >
        <Metaballs />
      </Float>
      <Environment preset="studio" />
    </Canvas>
  );
}
