"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";
import ProceduralShapes, { type GradientPalette } from "./ProceduralShapes";
import type { VariantState } from "../../store/variants";

type CanvasCamera = {
  position?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
};

export type ProceduralCanvasProps = {
  className?: string;
  camera?: CanvasCamera;
  dpr?: number | [number, number];
  lights?: ReactNode;
  variantOverride?: VariantState;
  palette?: GradientPalette;
  parallax?: boolean;
};

const defaultCamera: CanvasCamera = {
  position: [0, 0, 6],
  fov: 40,
};

const defaultLights = (
  <>
    <ambientLight intensity={0.65} color="#f6f5ff" />
    <directionalLight position={[4.5, 4.5, 6]} intensity={1.15} color="#ffe6f9" />
    <directionalLight position={[-3, -3.5, -2]} intensity={0.45} color="#99d9ff" />
  </>
);

export default function ProceduralCanvas({
  className,
  camera,
  dpr = [1, 1.75],
  lights = defaultLights,
  variantOverride,
  palette,
  parallax,
}: ProceduralCanvasProps) {
  return (
    <Canvas
      camera={{ ...defaultCamera, ...camera }}
      gl={{ antialias: true, alpha: true }}
      dpr={dpr}
      className={className}
    >
      {lights}
      <Suspense fallback={null}>
        <ProceduralShapes
          variantOverride={variantOverride}
          palette={palette}
          parallax={parallax}
        />
      </Suspense>
    </Canvas>
  );
}
