"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { Html } from "@react-three/drei";
import Shapes from "./ProceduralShapes";
import { useVariantStore, type VariantName } from "../../store/variants";

interface ExperienceProps {
  /**
   * The name of the variant to activate.  Valid values are
   * `home`, `about`, `work` and `contact`.  Each variant
   * repositions the shapes to spell out a different arrangement or
   * create a different composition.  See `store/variants.ts`.
   */
  variant: VariantName;
  /**
   * Optional class name applied to the wrapper so the canvas can be
   * positioned relative to different layouts.
   */
  className?: string;
}

export default function Experience({ variant, className }: ExperienceProps) {
  const setVariant = useVariantStore((state) => state.setVariant);

  // Whenever the variant prop changes, update the global store so that
  // animations can transition to the new values.  Because this is a
  // client component, `useEffect` will run only on the client.
  useEffect(() => {
    setVariant(variant);
  }, [variant, setVariant]);

  const containerClassName = className
    ? `${className} h-full w-full`
    : "h-full w-full";

  return (
    <div className={containerClassName}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        className="h-full w-full"
      >
        {/* Ambient and directional lighting to softly illuminate the shapes */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        {/* Optionally enable OrbitControls during development.  Uncomment to */}
        {/* orbit the camera around the scene. */}
        {/* <OrbitControls enableDamping /> */}
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-full bg-fg/10 px-6 py-3 text-sm font-medium text-fg/70 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]">
                Materializing shapes…
              </div>
            </Html>
          }
        >
          <Shapes />
          {/* Optional environment map; remove if not used.  You can place */}
          {/* an HDRI in public and reference it here to get realistic */}
          {/* reflections. */}
          {/* <Environment preset="city" /> */}
        </Suspense>
      </Canvas>
    </div>
  );
}
