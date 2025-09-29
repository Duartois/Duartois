"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { useVariantStore } from "../../store/variants";
import GradientMat from "../../materials/GradientMat";

// Tupla util p/ react-spring aceitar vetores
const tuple = (v: [number, number, number]) => v as unknown as THREE.Vector3Tuple;

export default function ProceduralShapes() {
  // Lê as variantes já usadas pelas suas páginas (home/work/about)
  const variant = useVariantStore((s) => s.variant);

  // === Geometrias (primitives — como no Sharlee) ===
  // Dois “C” (torus parciais), um “S” (tube em spline), e um “dot” (esfera).
  const cTopGeometry = useMemo(
    () => new THREE.TorusGeometry(1.0, 0.34, 40, 96, Math.PI * 1.5),
    []
  );
  const cBottomGeometry = useMemo(
    () => new THREE.TorusGeometry(1.0, 0.34, 40, 96, Math.PI * 1.5),
    []
  );
  const sGeometry = useMemo(() => {
    // S suave e centrípeta (sem self-intersection), bem fluido no hover
    const pts = [
      new THREE.Vector3(-1.05, -1.0, 0.0),
      new THREE.Vector3(-0.25, -0.35, 0.0),
      new THREE.Vector3(0.15, 0.15, 0.0),
      new THREE.Vector3(1.05, 1.0, 0.0),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.45);
    return new THREE.TubeGeometry(curve, 140, 0.24, 18, false);
  }, []);
  const dotGeometry = useMemo(() => new THREE.SphereGeometry(0.36, 48, 48), []);

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

  useFrame(({ clock }, dt) => {
    const g = groupRef.current;
    if (!g) return;

    const t = clock.getElapsedTime();

    // Parallax/tilt suave, reduzido em mobile
    const px = pointer.x * (isMobile ? 0.02 : 0.045);
    const py = pointer.y * (isMobile ? 0.015 : 0.035);

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
  });

  // === Paleta pastel (fixa por shape) — igual vibe do site de referência ===
  // Usa seu GradientMat para fresnel/iridescência e evita mexer em Tailwind aqui.
  const mats = useMemo(
    () => [
      { a: "#9CA3AF", b: "#6366F1" }, // C top: cinza→índigo
      { a: "#60A5FA", b: "#4338CA" }, // C bottom: azul→índigo
      { a: "#F472B6", b: "#EC4899" }, // S: rosa→pink
      { a: "#34D399", b: "#10B981" }, // dot: verde
    ],
    []
  );

  return (
    <group ref={groupRef}>
      {/* C de cima */}
      <a.mesh
        geometry={cTopGeometry}
        position={cTop.position}
        rotation-x={cTop.rotationX}
        rotation-y={cTop.rotationY}
        rotation-z={cTop.rotationZ}
      >
        <GradientMat colorA={mats[0].a} colorB={mats[0].b} fresnelStrength={1.2} />
      </a.mesh>

      {/* C de baixo */}
      <a.mesh
        geometry={cBottomGeometry}
        position={cBottom.position}
        rotation-x={cBottom.rotationX}
        rotation-y={cBottom.rotationY}
        rotation-z={cBottom.rotationZ}
      >
        <GradientMat colorA={mats[1].a} colorB={mats[1].b} fresnelStrength={1.2} />
      </a.mesh>

      {/* “S” (tube) */}
      <a.mesh
        geometry={sGeometry}
        position={sShape.position}
        rotation-x={sShape.rotationX}
        rotation-y={sShape.rotationY}
        rotation-z={sShape.rotationZ}
      >
        <GradientMat colorA={mats[2].a} colorB={mats[2].b} fresnelStrength={1.2} />
      </a.mesh>

      {/* Ponto (dot) */}
      <a.mesh
        geometry={dotGeometry}
        position={dot.position}
        rotation-x={dot.rotationX}
        rotation-y={dot.rotationY}
        rotation-z={dot.rotationZ}
      >
        <GradientMat colorA={mats[3].a} colorB={mats[3].b} fresnelStrength={1.2} />
      </a.mesh>
    </group>
  );
}
