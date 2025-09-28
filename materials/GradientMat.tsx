"use client";

import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Vector3 } from 'three';
import { ReactNode } from 'react';

const GradientMaterialImpl = shaderMaterial(
  {
    colorA: new Vector3(0.6, 0.6, 0.9),
    colorB: new Vector3(0.9, 0.9, 1.0),
    fresnelStrength: 1.0,
  },
  // vertex shader
  /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // fragment shader
  /* glsl */ `
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float fresnelStrength;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    void main() {
      // Compute fresnel term based on the angle between the view ray and the normal
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
      // Map world Y coordinate into [0, 1] for the gradient
      float h = clamp(vWorldPos.y * 0.5 + 0.5, 0.0, 1.0);
      vec3 base = mix(colorA, colorB, h);
      gl_FragColor = vec4(base + fresnel * fresnelStrength, 1.0);
    }
  `
);

// Register the material so that it can be used as <gradientMaterial />
extend({ GradientMaterial: GradientMaterialImpl });

interface GradientMatProps {
  colorA?: string;
  colorB?: string;
  fresnelStrength?: number;
  children?: ReactNode;
}

/**
 * Thin wrapper around the shader material.  It converts colour props
 * from strings into Three.js colour vectors and forwards the
 * fresnelStrength uniform.  Usage:
 *
 * ```tsx
 * <mesh>
 *   <boxGeometry args={[1,1,1]} />
 *   <GradientMat colorA="#f00" colorB="#00f" fresnelStrength={2.0} />
 * </mesh>
 * ```
 */
export default function GradientMat({ colorA, colorB, fresnelStrength }: GradientMatProps) {
  return (
    // @ts-ignore – three-stdlib extends the JSX namespace at runtime
    <gradientMaterial
      attach="material"
      args={[{}]}
      colorA={colorA}
      colorB={colorB}
      fresnelStrength={fresnelStrength}
    />
  );
}