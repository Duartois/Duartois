"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import {
  useVariantStore,
  type VariantState,
} from "../../store/variants";
import { GradientMaterialImpl, type GradientShaderMaterial } from "../../materials/GradientMat";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { useTheme } from "../../app/theme/ThemeContext";

export type GradientStops = [string, string, string, string];
export type GradientPalette = GradientStops[];

const LIGHT_THEME_PALETTE: GradientPalette = [
  ["#f1e8ff", "#e8d9ff", "#d9c4ff", "#ceb5ff"],
  ["#ffe7f2", "#ffd0e6", "#ffb8d8", "#ff8fbb"],
  ["#c8fff4", "#a8faea", "#7eeadf", "#3ecfd0"],
  ["#e8ffc8", "#ccf78f", "#b4ef66", "#9ae752"],
];

const DARK_THEME_PALETTE: GradientPalette = [
  ["#2c2150", "#42307d", "#6b3fb8", "#b67bff"],
  ["#310f27", "#5a1b47", "#99326f", "#ff6fa7"],
  ["#0b2d32", "#104b52", "#167a7a", "#3fe6d8"],
  ["#142818", "#1f4427", "#2f703a", "#7fe65e"],
];

const MATERIAL_CONFIGS = [
  { amp: 0.085, freq: 1.2, timeOffset: 0 },
  { amp: 0.095, freq: 1.05, timeOffset: 0.85 },
  { amp: 0.12, freq: 1.45, timeOffset: 1.6 },
  { amp: 0.075, freq: 0.9, timeOffset: 2.35 },
] as const;

// Tupla util p/ react-spring aceitar vetores
const tuple = (v: [number, number, number]) => v as unknown as THREE.Vector3Tuple;

type SVGResult = {
  paths: {
    id?: string;
    userData?: { node?: { id?: string } };
    toShapes: (isCCW: boolean) => THREE.Shape[];
  }[];
};

type ProceduralShapesProps = {
  /**
   * Overrides the global variant store and renders the provided transforms.
   * Useful for small previews that should not mutate the global scene.
   */
  variantOverride?: VariantState;
  /**
   * Custom colours for each mesh.  Pass four gradient stop arrays for the two
   * torus segments, the spline and the dot respectively.
   */
  palette?: GradientPalette;
  /**
   * Enables pointer based parallax.  Disable for static previews in tight
   * containers.
   */
  parallax?: boolean;
  /**
   * Signals the first stable frame render to external consumers (e.g. preloaders).
   */
  onStableFrame?: () => void;
};

export default function ProceduralShapes({
  variantOverride,
  palette,
  parallax = true,
  onStableFrame,
}: ProceduralShapesProps) {
  const { theme } = useTheme();
  // Lê as variantes já usadas pelas suas páginas (home/work/about)
  const storeVariant = useVariantStore((s) => s.variant);
  const variant = variantOverride ?? storeVariant;

  // === Geometrias (SVG extrusions + esfera “dot”) ===
  const svgPaths = useLoader(
    SVGLoader,
    "/shapes/procedural-shapes.svg"
  ) as SVGResult;

  const {
    magnetTopGeometry,
    waveGeometry,
    magnetBottomGeometry,
    openLoopGeometry,
  } = useMemo(() => {
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 16,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 6,
      bevelSize: 6,
      bevelSegments: 10,
      curveSegments: 96,
    };

    const centerAndScale = (
      geometry: THREE.ExtrudeGeometry,
      targetSize: number
    ) => {
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox;
      if (bbox) {
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y);
        if (maxDim > 0) {
          const scale = targetSize / maxDim;
          geometry.scale(scale, scale, scale);
        }
      }
      geometry.center();
    };

    const createGeometry = (id: string, targetSize: number) => {
      const path = svgPaths.paths.find(
        (p) => p.userData?.node?.id === id || p.id === id
      );
      if (!path) {
        return null;
      }
      const shapes = path.toShapes(true);
      const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
      centerAndScale(geometry, targetSize);
      return geometry;
    };

    return {
      magnetTopGeometry: createGeometry("Magnet1", 2.4),
      waveGeometry: createGeometry("Wave", 2.2),
      magnetBottomGeometry: createGeometry("Magnet2", 2.4),
      openLoopGeometry: createGeometry("OpenLoop", 2.0),
    };
  }, [svgPaths]);

  useEffect(() => {
    return () => {
      magnetTopGeometry?.dispose();
      waveGeometry?.dispose();
      magnetBottomGeometry?.dispose();
      openLoopGeometry?.dispose();
    };
  }, [
    magnetTopGeometry,
    waveGeometry,
    magnetBottomGeometry,
    openLoopGeometry,
  ]);

  const dotGeometry = useMemo(() => new THREE.SphereGeometry(0.36, 48, 48), []);
  useEffect(() => {
    return () => {
      dotGeometry.dispose();
    };
  }, [dotGeometry]);

  const gradientMaterials = useMemo(
    () =>
      MATERIAL_CONFIGS.map((config) => {
        const material = new GradientMaterialImpl() as GradientShaderMaterial;
        material.uniforms.uAmp.value = config.amp;
        material.uniforms.uFreq.value = config.freq;
        return material;
      }) as [
        GradientShaderMaterial,
        GradientShaderMaterial,
        GradientShaderMaterial,
        GradientShaderMaterial,
      ],
    []
  );

  useEffect(() => {
    return () => {
      gradientMaterials.forEach((material) => material.dispose());
    };
  }, [gradientMaterials]);

  const defaultPalette = useMemo<GradientPalette>(
    () => (theme === "dark" ? DARK_THEME_PALETTE : LIGHT_THEME_PALETTE),
    [theme]
  );

  useEffect(() => {
    const paletteSource = palette ?? defaultPalette;
    gradientMaterials.forEach((material, index) => {
      const stops = paletteSource[index] ?? defaultPalette[index];
      if (!stops) return;
      const [c1, c2, c3, c4] = stops;
      material.uniforms.uColor1.value.set(c1);
      material.uniforms.uColor2.value.set(c2);
      material.uniforms.uColor3.value.set(c3);
      material.uniforms.uColor4.value.set(c4);
    });
  }, [palette, defaultPalette, gradientMaterials]);

  const [magnetTopMaterial, magnetBottomMaterial, waveMaterial, dotMaterial] =
    gradientMaterials;

  // === Springs por shape (compatível com seu store) ===
  const springCfg = { mass: 5, tension: 320, friction: 50 } as const;

  const cTop = useSpring({
    position: tuple(variant.cTop.position),
    rotationX: variant.cTop.rotation[0],
    rotationY: variant.cTop.rotation[1],
    rotationZ: variant.cTop.rotation[2],
    config: springCfg,
  });

  const cBottom = useSpring({
    position: tuple(variant.cBottom.position),
    rotationX: variant.cBottom.rotation[0],
    rotationY: variant.cBottom.rotation[1],
    rotationZ: variant.cBottom.rotation[2],
    config: springCfg,
  });

  const sShape = useSpring({
    position: tuple(variant.sShape.position),
    rotationX: variant.sShape.rotation[0],
    rotationY: variant.sShape.rotation[1],
    rotationZ: variant.sShape.rotation[2],
    config: springCfg,
  });

  const dot = useSpring({
    position: tuple(variant.dot.position),
    rotationX: variant.dot.rotation[0],
    rotationY: variant.dot.rotation[1],
    rotationZ: variant.dot.rotation[2],
    config: springCfg,
  });

  // === Grupo mestre: parallax/tilt + “breathing” (vibe Sharlee) ===
  const groupRef = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();

  const isMobile = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 768px)").matches
        : false,
    []
  );

  const stableFrameTimerRef = useRef(0);
  const stableFrameTriggeredRef = useRef(false);
  const stableFrameCallbackRef = useRef(onStableFrame);

  useEffect(() => {
    stableFrameCallbackRef.current = onStableFrame;
  }, [onStableFrame]);

  useFrame(({ clock }, dt) => {
    const g = groupRef.current;
    if (!g) return;

    const t = clock.getElapsedTime();

    // Parallax/tilt suave, reduzido em mobile
    const px = parallax ? pointer.x * (isMobile ? 0.02 : 0.045) : 0;
    const py = parallax ? pointer.y * (isMobile ? 0.015 : 0.035) : 0;

    // “Respiração” sutil
    const breathe = (isMobile ? 0.006 : 0.01) * Math.sin(t * 0.8);

    // Lerp manual (sem libs extras)
    g.position.x += ((px * 0.9) - g.position.x) * Math.min(1, dt * 8);
    g.position.y += ((py * 0.8) - g.position.y) * Math.min(1, dt * 8);
    const targetRotX = py * 0.25 + breathe;
    const targetRotY = -px * 0.35;
    g.rotation.x += (targetRotX - g.rotation.x) * Math.min(1, dt * 6);
    g.rotation.y += (targetRotY - g.rotation.y) * Math.min(1, dt * 6);
    const s = 1 + breathe;
    g.scale.x += (s - g.scale.x) * Math.min(1, dt * 4);
    g.scale.y += (s - g.scale.y) * Math.min(1, dt * 4);
    g.scale.z += (s - g.scale.z) * Math.min(1, dt * 4);

    // Limites p/ não sair de quadro
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const maxX = (isMobile ? 0.18 : 0.28) * (viewport.width / 2);
    const maxY = (isMobile ? 0.14 : 0.22) * (viewport.height / 2);
    g.position.x = clamp(g.position.x, -maxX, maxX);
    g.position.y = clamp(g.position.y, -maxY, maxY);

    gradientMaterials.forEach((material, index) => {
      const { amp, timeOffset } = MATERIAL_CONFIGS[index];
      const time = t + timeOffset;
      material.uniforms.uTime.value = time;
      material.uniforms.uAmp.value =
        amp * (1 + 0.22 * Math.sin(time * 0.65 + index * 0.2));
    });

    if (!stableFrameTriggeredRef.current) {
      stableFrameTimerRef.current += dt;
      if (stableFrameTimerRef.current > 0.1) {
        stableFrameTriggeredRef.current = true;
        stableFrameCallbackRef.current?.();
      }
    }
  });

  if (
    !magnetTopGeometry ||
    !waveGeometry ||
    !magnetBottomGeometry ||
    !openLoopGeometry
  ) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* C de cima */}
      <a.mesh
        geometry={magnetTopGeometry}
        position={cTop.position}
        rotation-x={cTop.rotationX}
        rotation-y={cTop.rotationY}
        rotation-z={cTop.rotationZ}
        material={magnetTopMaterial}
      />

      {/* C de baixo */}
      <a.mesh
        geometry={magnetBottomGeometry}
        position={cBottom.position}
        rotation-x={cBottom.rotationX}
        rotation-y={cBottom.rotationY}
        rotation-z={cBottom.rotationZ}
        material={magnetBottomMaterial}
      />

      {/* “S” (tube) */}
      <a.mesh
        geometry={waveGeometry}
        position={sShape.position}
        rotation-x={sShape.rotationX}
        rotation-y={sShape.rotationY}
        rotation-z={sShape.rotationZ}
        material={waveMaterial}
      />

      {/* Ponto (dot) */}
      <a.group
        position={dot.position}
        rotation-x={dot.rotationX}
        rotation-y={dot.rotationY}
        rotation-z={dot.rotationZ}
      >
        <mesh geometry={openLoopGeometry} material={dotMaterial} />
        <mesh geometry={dotGeometry} material={dotMaterial} />
      </a.group>
    </group>
  );
}
