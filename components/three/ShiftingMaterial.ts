import * as THREE from "three";

// Simplex-like noise injected into the vertex shader
// This runs entirely on the GPU, freeing the CPU for React/DOM work
const NOISE_GLSL = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

export type ShiftingMaterialOptions = {
  color?: string;
  matcapUrl?: string;
  noiseStrength?: number;
  noiseSpeed?: number;
  isDark?: boolean;
};

/**
 * Creates a MeshMatcapMaterial with a custom vertex shader that applies
 * GPU-side noise distortion. This is dramatically cheaper than MeshPhysicalMaterial
 * because matcap doesn't calculate real-time lighting — it samples a texture lookup.
 *
 * The "liquid" / "shifting" effect runs entirely on the GPU via the vertex shader,
 * freeing the CPU for React rendering, routing, and DOM work.
 */
export const createShiftingMaterial = (
  options: ShiftingMaterialOptions = {},
): THREE.MeshMatcapMaterial & { uniforms: { uTime: { value: number }; uStrength: { value: number } } } => {
  const {
    noiseStrength = 0.065,
    noiseSpeed = 0.38,
    isDark = false,
  } = options;

  // MeshMatcapMaterial: cheapest "good looking" material in Three.js
  // It doesn't compute lights at runtime — it just samples a pre-baked sphere texture
  const material = new THREE.MeshMatcapMaterial({
    vertexColors: !isDark,
    transparent: false,
    side: THREE.FrontSide,
  });

  // Shared uniforms object — mutate uTime.value each frame from outside
  const uniforms = {
    uTime: { value: 0.0 },
    uStrength: { value: noiseStrength },
    uSpeed: { value: noiseSpeed },
  };

  // Inject custom code into Three.js compiled shader via onBeforeCompile
  // This is the same pattern used by high-end Three.js sites (Codrops, Awwwards)
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uStrength = uniforms.uStrength;
    shader.uniforms.uSpeed = uniforms.uSpeed;

    // Inject noise functions before the main vertex shader
    shader.vertexShader = NOISE_GLSL + shader.vertexShader;

    // Add uniform declarations after the built-in ones
    shader.vertexShader = shader.vertexShader.replace(
      `#include <common>`,
      `#include <common>
       uniform float uTime;
       uniform float uStrength;
       uniform float uSpeed;`,
    );

    // Replace the position transform to add noise displacement
    // This modifies vertex positions on the GPU — zero CPU cost
    shader.vertexShader = shader.vertexShader.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
       float noiseVal = snoise(vec3(
         position.x * 0.9 + uTime * uSpeed * 0.4,
         position.y * 0.9 + uTime * uSpeed * 0.3,
         position.z * 0.9 + uTime * uSpeed * 0.5
       ));
       // Displace along the normal direction for an organic "breathing" effect
       transformed += normal * noiseVal * uStrength;`,
    );
  };

  // Attach uniforms so the caller can update uTime each frame
  (material as any).uniforms = uniforms;

  return material as THREE.MeshMatcapMaterial & {
    uniforms: { uTime: { value: number }; uStrength: { value: number } };
  };
};

/**
 * Call this once per animation frame to advance the shader time uniform.
 * Pass the result of THREE.Clock.getElapsedTime().
 */
export const updateShiftingMaterialTime = (
  material: ReturnType<typeof createShiftingMaterial>,
  elapsedTime: number,
) => {
  if ((material as any).uniforms?.uTime) {
    (material as any).uniforms.uTime.value = elapsedTime;
  }
};
