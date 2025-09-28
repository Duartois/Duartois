"use client";

import { useMemo } from 'react';
import { CatmullRomCurve3, TorusGeometry, TubeGeometry, SphereGeometry, Vector3 } from 'three';
import type { Vector3Tuple } from 'three';
import { a, useSpring } from '@react-spring/three';
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
  const tuple = (value: [number, number, number]) => value as Vector3Tuple;
  const sharedConfig = { mass: 5, tension: 300, friction: 50 } as const;

  const cTopSpring = useSpring({
    position: tuple(variant.cTop.position),
    rotationX: variant.cTop.rotation[0],
    rotationY: variant.cTop.rotation[1],
    rotationZ: variant.cTop.rotation[2],
    config: sharedConfig,
  });
  const cBottomSpring = useSpring({
    position: tuple(variant.cBottom.position),
    rotationX: variant.cBottom.rotation[0],
    rotationY: variant.cBottom.rotation[1],
    rotationZ: variant.cBottom.rotation[2],
    config: sharedConfig,
  });
  const sSpring = useSpring({
    position: tuple(variant.sShape.position),
    rotationX: variant.sShape.rotation[0],
    rotationY: variant.sShape.rotation[1],
    rotationZ: variant.sShape.rotation[2],
    config: sharedConfig,
  });
  const dotSpring = useSpring({
    position: tuple(variant.dot.position),
    rotationX: variant.dot.rotation[0],
    rotationY: variant.dot.rotation[1],
    rotationZ: variant.dot.rotation[2],
    config: sharedConfig,
  });

  return (
    <>
      {/* Top C shape */}
      <a.mesh
        geometry={cGeometry}
        position={cTopSpring.position}
        rotation-x={cTopSpring.rotationX}
        rotation-y={cTopSpring.rotationY}
        rotation-z={cTopSpring.rotationZ}
      >
        <GradientMat colorA="#9CA3AF" colorB="#6366F1" fresnelStrength={1.2} />
      </a.mesh>
      {/* Bottom C shape */}
      <a.mesh
        geometry={cBottomGeometry}
        position={cBottomSpring.position}
        rotation-x={cBottomSpring.rotationX}
        rotation-y={cBottomSpring.rotationY}
        rotation-z={cBottomSpring.rotationZ}
      >
        <GradientMat colorA="#60A5FA" colorB="#4338CA" fresnelStrength={1.2} />
      </a.mesh>
      {/* S shape built from a tube along a Catmull Rom curve */}
      <a.mesh
        geometry={sGeometry}
        position={sSpring.position}
        rotation-x={sSpring.rotationX}
        rotation-y={sSpring.rotationY}
        rotation-z={sSpring.rotationZ}
      >
        <GradientMat colorA="#F472B6" colorB="#EC4899" fresnelStrength={1.2} />
      </a.mesh>
      {/* Dot */}
      <a.mesh
        geometry={dotGeometry}
        position={dotSpring.position}
        rotation-x={dotSpring.rotationX}
        rotation-y={dotSpring.rotationY}
        rotation-z={dotSpring.rotationZ}
      >
        <GradientMat colorA="#34D399" colorB="#10B981" fresnelStrength={1.2} />
      </a.mesh>
    </>
  );
}