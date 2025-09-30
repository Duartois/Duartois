"use client";

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Color, ShaderMaterial } from "three";
import { ForwardedRef, forwardRef, useMemo } from "react";

export type GradientUniforms = {
  uColor1: { value: Color };
  uColor2: { value: Color };
  uColor3: { value: Color };
  uColor4: { value: Color };
  uTime: { value: number };
  uAmp: { value: number };
  uFreq: { value: number };
};

export type GradientShaderMaterial = ShaderMaterial & {
  uniforms: GradientUniforms;
};

const GradientMaterialImpl = shaderMaterial(
  {
    uColor1: new Color("#f1e8ff"),
    uColor2: new Color("#e8d9ff"),
    uColor3: new Color("#d9c4ff"),
    uColor4: new Color("#ceb5ff"),
    uTime: 0,
    uAmp: 0.08,
    uFreq: 1.25,
  },
  /* glsl */ `
    uniform float uTime;
    uniform float uAmp;
    uniform float uFreq;

    varying vec3 vNormal;
    varying vec3 vWorldPos;

    void main() {
      vec3 displacedPosition = position;
      float wave = sin((position.x + position.y + position.z) * uFreq + uTime) * uAmp;
      displacedPosition += normal * wave;

      vec4 worldPos = modelMatrix * vec4(displacedPosition, 1.0);
      vWorldPos = worldPos.xyz;
      vNormal = normalize(normalMatrix * normal);

      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  /* glsl */ `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;

    varying vec3 vNormal;
    varying vec3 vWorldPos;

    vec3 sampleGradient(float h) {
      vec3 c12 = mix(uColor1, uColor2, smoothstep(0.0, 0.33, h));
      vec3 c23 = mix(uColor2, uColor3, smoothstep(0.33, 0.66, h));
      vec3 c34 = mix(uColor3, uColor4, smoothstep(0.66, 1.0, h));

      vec3 mixMid = mix(c12, c23, smoothstep(0.33, 0.66, h));
      return mix(mixMid, c34, smoothstep(0.66, 1.0, h));
    }

    void main() {
      float height = clamp(vWorldPos.y * 0.3 + 0.5, 0.0, 1.0);
      vec3 gradient = sampleGradient(height);

      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      vec3 normal = normalize(vNormal);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

      vec3 colour = gradient + fresnel * 0.45;
      gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
    }
  `
) as unknown as { new (): GradientShaderMaterial };

extend({ GradientMaterial: GradientMaterialImpl });

interface GradientMatProps {
  colors?: [string, string, string, string];
  uTime?: number;
  uAmp?: number;
  uFreq?: number;
}

function GradientMat(
  { colors, uTime, uAmp, uFreq }: GradientMatProps,
  ref: ForwardedRef<GradientShaderMaterial>
) {
  const colorValues = useMemo(() => {
    if (!colors) return undefined;
    return colors.map((hex) => new Color(hex)) as [Color, Color, Color, Color];
  }, [colors]);

  return (
    // @ts-ignore three-stdlib extends the JSX namespace at runtime
    <gradientMaterial
      ref={ref}
      attach="material"
      args={[{}]}
      uColor1={colorValues?.[0]}
      uColor2={colorValues?.[1]}
      uColor3={colorValues?.[2]}
      uColor4={colorValues?.[3]}
      uTime={uTime}
      uAmp={uAmp}
      uFreq={uFreq}
    />
  );
}

export default forwardRef<GradientShaderMaterial, GradientMatProps>(GradientMat);
export { GradientMaterialImpl };