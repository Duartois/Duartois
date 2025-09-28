"use client";

import { useMemo } from 'react';
import { CatmullRomCurve3, TorusGeometry, TubeGeometry, SphereGeometry, Vector3 } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { useVariantStore } from '../../store/variants';
import GradientMat from '../../materials/GradientMat';

/**
 * Procedurally generates and animates the monogram shapes.  Each shape
 * is built from Three.js primitives and animated towards its target
 * transformation defined in the `variant` store.  The component
 * re-renders only when the variant changes.
 */
export default function ProceduralShapes() {
  // Subscribe to the current variant state from the zustand store
  const variant = useVariantStore((state) => state.variant);

  // Precompute geometries once.  Without `useMemo` these would
  // allocate new BufferGeometry instances on every render.
  const cGeometry = useMemo(() => new TorusGeometry(1.0, 0.35, 32, 64, Math.PI * 1.5), []);
  const cBottomGeometry = useMemo(() => new TorusGeometry(1.0, 0.35, 32, 64, Math.PI * 1.5), []);
  const sCurve = useMemo(() => {
    // Control points for a gentle S curve.  Feel free to adjust these
    // to taste; more points yield a smoother spline.  The points
    // should be roughly centred around the origin for easier placement.
    const points = [
      new Vector3(-1.0, -1.0, 0.0),
      new Vector3(0.0, -0.5, 0.0),
      new Vector3(0.0, 0.5, 0.0),
      new Vector3(1.0, 1.0, 0.0),
    ];
    return new CatmullRomCurve3(points);
  }, []);
  const sGeometry = useMemo(() => new TubeGeometry(sCurve, 100, 0.25, 16, false), [sCurve]);
  const dotGeometry = useMemo(() => new SphereGeometry(0.35, 32, 32), []);

  // Animations: each shape uses its own spring to interpolate towards
  // the target position and rotation defined in the variant store.
  const cTopSpring = useSpring({
    position: variant.cTop.position,
    rotation: variant.cTop.rotation,
    config: { mass: 5, tension: 300, friction: 50 },
  });
  const cBottomSpring = useSpring({
    position: variant.cBottom.position,
    rotation: variant.cBottom.rotation,
    config: { mass: 5, tension: 300, friction: 50 },
  });
  const sSpring = useSpring({
    position: variant.sShape.position,
    rotation: variant.sShape.rotation,
    config: { mass: 5, tension: 300, friction: 50 },
  });
  const dotSpring = useSpring({
    position: variant.dot.position,
    rotation: variant.dot.rotation,
    config: { mass: 5, tension: 300, friction: 50 },
  });

  return (
    <>
      {/* Top C shape */}
      <animated.mesh
        geometry={cGeometry}
        position={cTopSpring.position}
        rotation={cTopSpring.rotation}
      >
        <GradientMat colorA="#9CA3AF" colorB="#6366F1" fresnelStrength={1.2} />
      </animated.mesh>
      {/* Bottom C shape */}
      <animated.mesh
        geometry={cBottomGeometry}
        position={cBottomSpring.position}
        rotation={cBottomSpring.rotation}
      >
        <GradientMat colorA="#60A5FA" colorB="#4338CA" fresnelStrength={1.2} />
      </animated.mesh>
      {/* S shape built from a tube along a Catmull Rom curve */}
      <animated.mesh
        geometry={sGeometry}
        position={sSpring.position}
        rotation={sSpring.rotation}
      >
        <GradientMat colorA="#F472B6" colorB="#EC4899" fresnelStrength={1.2} />
      </animated.mesh>
      {/* Dot */}
      <animated.mesh
        geometry={dotGeometry}
        position={dotSpring.position}
        rotation={dotSpring.rotation}
      >
        <GradientMat colorA="#34D399" colorB="#10B981" fresnelStrength={1.2} />
      </animated.mesh>
    </>
  );
}