"use client";

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { Environment, OrbitControls, Html } from '@react-three/drei';
import Preloader from './Preloader';
import Shapes from './shapes/ProceduralShapes';
import { useVariantStore } from '../store/variants';

interface ExperienceProps {
  /**
   * The name of the variant to activate.  Valid values are
   * `home`, `about`, `work` and `contact`.  Each variant
   * repositions the shapes to spell out a different arrangement or
   * create a different composition.  See `store/variants.ts`.
   */
  variant: 'home' | 'about' | 'work' | 'contact';
}

export default function Experience({ variant }: ExperienceProps) {
  const setVariant = useVariantStore((state) => state.setVariant);

  // Whenever the variant prop changes, update the global store so that
  // animations can transition to the new values.  Because this is a
  // client component, `useEffect` will run only on the client.
  useEffect(() => {
    setVariant(variant);
  }, [variant, setVariant]);

  return (
    <div className="w-screen h-screen">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        {/* Ambient and directional lighting to softly illuminate the shapes */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        {/* Optionally enable OrbitControls during development.  Uncomment to
            orbit the camera around the scene. */}
        {/* <OrbitControls enableDamping /> */}
        <Suspense
          fallback={
            <Html center>
              <Preloader />
            </Html>
          }
        >
          <Shapes />
          {/* Optional environment map; remove if not used.  You can place
              an HDRI in public and reference it here to get realistic
              reflections. */}
          {/* <Environment preset="city" /> */}
        </Suspense>
      </Canvas>
    </div>
  );
}