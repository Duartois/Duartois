"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";

import { addDuartoisSignatureShapes } from "@/components/three/addShapes";
import { createCamera } from "@/components/three/factories";
import {
  MENU_OVERLAY_MONOGRAM,
  createResponsiveHeroVariantState,
  DEFAULT_BRIGHTNESS,
  type ThemeName,
  type VariantState,
} from "@/components/three/types";

const MENU_BREAKPOINT = 1500;

type LoseContextExt = { loseContext: () => void; restoreContext: () => void };

declare global {
  interface Window {
    __DUARTOIS_GL_LOSERS__?: LoseContextExt[];
    __DUARTOIS_EXPORT__?: {
      exportOne: (id: string, crop: boolean) => Promise<void>;
      exportAll: (crop: boolean) => Promise<void>;
    };
  }
}

// Mata contextos antigos que ficaram presos por Fast Refresh
function loseOldWebGLContexts() {
  const list = window.__DUARTOIS_GL_LOSERS__;
  if (!list?.length) return;
  for (const ext of list) {
    try {
      ext.loseContext();
    } catch {}
  }
  window.__DUARTOIS_GL_LOSERS__ = [];
}

// Rim “bolha”
const BUBBLE_RIM_VS = `
  varying vec3 vWPos;
  varying vec3 vWNorm;

  void main() {
    vec4 wPos = modelMatrix * vec4(position, 1.0);
    vWPos = wPos.xyz;
    vWNorm = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wPos;
  }
`;

const BUBBLE_RIM_FS = `
  uniform vec3 uTop;
  uniform vec3 uBot;
  uniform float uPower;
  uniform float uAlpha;

  varying vec3 vWPos;
  varying vec3 vWNorm;

  void main() {
    vec3 V = normalize(cameraPosition - vWPos);
    float ndv = clamp(dot(normalize(vWNorm), V), 0.0, 1.0);
    float fres = pow(1.0 - ndv, uPower);

    float up = clamp(vWNorm.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 tint = mix(uBot, uTop, up);

    vec3 rgb = tint * fres;
    gl_FragColor = vec4(rgb, fres * uAlpha);
  }
`;

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function nextFrame() {
  return new Promise<void>((r) => requestAnimationFrame(() => r()));
}

// Export sem preserveDrawingBuffer: renderTarget -> pixels -> canvas2d -> blob
async function capturePngFromRenderTarget(opts: {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  width: number;
  height: number;
  pixelRatio: number;
}): Promise<Blob> {
  const { renderer, scene, camera, width, height, pixelRatio } = opts;

  const pw = Math.max(1, Math.floor(width * pixelRatio));
  const ph = Math.max(1, Math.floor(height * pixelRatio));

  const rt = new THREE.WebGLRenderTarget(pw, ph, {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: true,
    stencilBuffer: false,
  });
  rt.texture.colorSpace = THREE.SRGBColorSpace;

  const prevRT = renderer.getRenderTarget();
  const prevClear = new THREE.Color();
  renderer.getClearColor(prevClear);
  const prevAlpha = renderer.getClearAlpha();

  renderer.setRenderTarget(rt);
  renderer.setClearColor(0x000000, 0);
  renderer.clear(true, true, true);
  renderer.render(scene, camera);

  const buf = new Uint8Array(pw * ph * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, pw, ph, buf);

  renderer.setRenderTarget(prevRT);
  renderer.setClearColor(prevClear, prevAlpha);

  // flip Y
  const canvas2d = document.createElement("canvas");
  canvas2d.width = pw;
  canvas2d.height = ph;

  const ctx = canvas2d.getContext("2d");
  if (!ctx) {
    rt.dispose();
    throw new Error("Falha ao criar canvas 2D para export.");
  }

  const img = ctx.createImageData(pw, ph);
  const row = pw * 4;
  for (let y = 0; y < ph; y++) {
    const srcStart = (ph - 1 - y) * row;
    const dstStart = y * row;
    img.data.set(buf.subarray(srcStart, srcStart + row), dstStart);
  }
  ctx.putImageData(img, 0, 0);

  rt.dispose();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas2d.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob retornou null"))),
      "image/png"
    );
  });

  return blob;
}

type ShapesHandle = Awaited<ReturnType<typeof addDuartoisSignatureShapes>>;

export default function MenuShapesExportPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const shapesRef = useRef<ShapesHandle | null>(null);
  const meshesRef = useRef<Record<string, THREE.Mesh>>({});

  const [ids, setIds] = useState<string[]>([]);
  const [crop, setCrop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Força recriar o <canvas> (novo contexto) em caso de contexto “preso”
  const [canvasKey, setCanvasKey] = useState(0);
  const resetWebGL = useCallback(() => setCanvasKey((k) => k + 1), []);

  const theme: ThemeName = "light";

  const previewBg = useMemo(
    () =>
      "radial-gradient(1200px 900px at 50% 45%, #b3b6c6 0%, #8f92a8 55%, #7c7f98 100%)",
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let mounted = true;
    let raf = 0;

    setLoading(true);
    setError(null);

    // Dev: mata contexts velhos de fast refresh
    try {
      loseOldWebGLContexts();
    } catch {}

    // listeners de context lost
    const onLost = (e: Event) => {
      e.preventDefault();
      console.error("[menu-shapes-export] webglcontextlost");
      if (!mounted) return;
      setError("WebGL context lost (driver/limite de contextos). Clique em “Reiniciar WebGL”.");
      setLoading(false);
    };
    canvas.addEventListener("webglcontextlost", onLost, { passive: false });

    const getRectSize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      return { w, h, aspect: w / h };
    };

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.OrthographicCamera | null = null;

    const extraMaterials = new Set<THREE.Material>();
    const extraMeshes: THREE.Object3D[] = [];
    const extraTextures = new Set<THREE.Texture>();

    const safeDisposeRenderer = () => {
      try {
        renderer?.renderLists?.dispose?.();
        renderer?.dispose();
        renderer?.forceContextLoss?.();
      } catch {}
    };

    // 1) cria contexto manualmente
    const attrs: WebGLContextAttributes = {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    };

    canvas.width = 2;
    canvas.height = 2;

    const gl2 = canvas.getContext("webgl2", attrs) as WebGL2RenderingContext | null;
    const gl =
      gl2 ||
      (canvas.getContext("webgl", attrs) as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl", attrs) as WebGLRenderingContext | null);

    if (!gl) {
      setError(
        "Não foi possível criar contexto WebGL (getContext retornou null). " +
          "Feche abas com WebGL / reinicie o navegador / teste aba anônima."
      );
      setLoading(false);
      canvas.removeEventListener("webglcontextlost", onLost as any);
      return;
    }

    // 2) registra extensão para conseguir “matar” depois em fast refresh
    try {
      const loseExt = gl.getExtension("WEBGL_lose_context") as unknown as LoseContextExt | null;
      if (loseExt) {
        window.__DUARTOIS_GL_LOSERS__ ??= [];
        window.__DUARTOIS_GL_LOSERS__.push(loseExt);
      }
    } catch {}

    // 3) valida atributos
    try {
      const ctxAttrs = (gl as any).getContextAttributes?.() ?? null;
      if (!ctxAttrs) {
        setError("Contexto WebGL foi criado como “lost”. Clique em “Reiniciar WebGL”.");
        setLoading(false);
        return;
      }
    } catch {}

    // 4) cria renderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl as any,
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "default",
      });

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = false;

      // Volta “vida” das cores (mais próximo da imagem 1)
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.06;
    } catch (e) {
      console.error("[menu-shapes-export] WebGL init failed:", e);
      setError("Falha ao iniciar WebGL (contexto indisponível/lost). Clique em “Reiniciar WebGL”.");
      setLoading(false);
      safeDisposeRenderer();
      return;
    }

    // scene/camera
    scene = new THREE.Scene();
    camera = createCamera() as THREE.OrthographicCamera;
    camera.position.set(0, 0, 15);
    camera.near = 0.1;
    camera.far = 100;
    camera.layers.enableAll();
    camera.updateProjectionMatrix();
    scene.add(camera);

    // Lights: volta um pouco de “reflexo”, mas sem virar streak duro
    scene.add(new THREE.HemisphereLight(0xffffff, 0x4a4b5a, 0.62));

    const key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(-7, 9, 12);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.40);
    fill.position.set(9, 2, 8);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.55);
    rim.position.set(0, -8, 14);
    scene.add(rim);

    scene.add(new THREE.AmbientLight(0xffffff, 0.10));

    const setCameraAspect = (aspect: number) => {
      if (!camera) return;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    };

    const fitCameraToObject = (obj: THREE.Object3D, aspect: number, padding = 1.18) => {
      if (!camera) return;
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const wObj = Math.max(1e-6, size.x * padding);
      const hObj = Math.max(1e-6, size.y * padding);

      const zoomW = (2 * aspect) / wObj;
      const zoomH = 2 / hObj;

      camera.zoom = Math.min(zoomW, zoomH);
      camera.position.set(center.x, center.y, camera.position.z);
      camera.updateProjectionMatrix();
    };

    const applyVariant = (w: number, h: number) => {
      const v: VariantState = createResponsiveHeroVariantState(
        MENU_OVERLAY_MONOGRAM,
        w,
        h,
        MENU_BREAKPOINT,
        MENU_BREAKPOINT
      );
      shapesRef.current?.applyVariant(v);
    };

    const renderOnce = () => {
      if (!renderer || !scene || !camera) return;
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, true);
      renderer.render(scene, camera);
    };

    const resize = () => {
      if (!renderer) return;
      const { w, h, aspect } = getRectSize();
      renderer.setSize(w, h, false);
      setCameraAspect(aspect);

      applyVariant(w, h);

      const shapes = shapesRef.current;
      if (shapes) fitCameraToObject(shapes.group, aspect, 1.18);

      renderOnce();
    };

    // ---------- Texturas “airbrush” (sombra + haze) ----------
    const makeRadialTex = (stops: Array<[number, string]>) => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 126);
      for (const [p, col] of stops) g.addColorStop(p, col);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      extraTextures.add(tex);
      return tex;
    };

    const shadowTex = makeRadialTex([
      [0.0, "rgba(0,0,0,0.34)"],
      [0.55, "rgba(0,0,0,0.13)"],
      [1.0, "rgba(0,0,0,0.0)"],
    ]);

    const hazeTex = makeRadialTex([
      [0.0, "rgba(255,255,255,0.22)"],
      [0.48, "rgba(255,255,255,0.10)"],
      [1.0, "rgba(255,255,255,0.0)"],
    ]);

    const addSoftAirbrush = (mesh: THREE.Mesh) => {
      mesh.geometry.computeBoundingBox();
      const bb = mesh.geometry.boundingBox;
      if (!bb) return;

      const sx = mesh.scale.x || 1;
      const sy = mesh.scale.y || 1;

      const w = Math.max(0.001, (bb.max.x - bb.min.x) * sx);
      const h = Math.max(0.001, (bb.max.y - bb.min.y) * sy);

      // sombra
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        depthTest: false,
      });
      extraMaterials.add(shadowMat);

      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
      shadow.scale.set(w * 1.95, h * 1.95, 1);
      shadow.position.set(0, 0, -0.42);
      shadow.renderOrder = -30;

      // haze (a “névoa” ao redor, imagem 1)
      const hazeMat = new THREE.MeshBasicMaterial({
        map: hazeTex,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });
      extraMaterials.add(hazeMat);

      const haze = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), hazeMat);
      haze.scale.set(w * 2.55, h * 2.55, 1);
      haze.position.set(0, 0, -0.62);
      haze.renderOrder = -29;

      mesh.add(shadow);
      mesh.add(haze);

      extraMeshes.push(shadow, haze);
    };

    // ---------- Bubble rig (contorno transparente + reflexo, volta cores) ----------
    const addBubbleRig = (mesh: THREE.Mesh) => {
      addSoftAirbrush(mesh);

      // Capa “bolha” transparente (melhor que shell matte)
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#ffffff"),
        metalness: 0.0,
        roughness: 0.62, // soft highlight (sem streak duro)
        transmission: 1.0,
        thickness: 0.28,
        ior: 1.33,
        clearcoat: 1.0,
        clearcoatRoughness: 0.28,
        transparent: true,
        opacity: 0.20, // contorno transparente visível
        depthWrite: false,
      });
      extraMaterials.add(glassMat);

      const bubbleGlass = new THREE.Mesh(mesh.geometry, glassMat);
      bubbleGlass.scale.set(1.035, 1.035, 1.035);
      bubbleGlass.renderOrder = 10;
      bubbleGlass.frustumCulled = false;

      // Rim fino (mais presente, como a imagem 1)
      const rimThinMat = new THREE.ShaderMaterial({
        vertexShader: BUBBLE_RIM_VS,
        fragmentShader: BUBBLE_RIM_FS,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTop: { value: new THREE.Color("#BFFFE7") },
          uBot: { value: new THREE.Color("#FFC1E6") },
          uPower: { value: 2.35 },
          uAlpha: { value: 0.56 },
        },
      });
      extraMaterials.add(rimThinMat);

      const bubbleRimThin = new THREE.Mesh(mesh.geometry, rimThinMat);
      bubbleRimThin.scale.set(1.07, 1.07, 1.07);
      bubbleRimThin.renderOrder = 11;
      bubbleRimThin.frustumCulled = false;

      // Glow maior (halo suave)
      const rimGlowMat = new THREE.ShaderMaterial({
        vertexShader: BUBBLE_RIM_VS,
        fragmentShader: BUBBLE_RIM_FS,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTop: { value: new THREE.Color("#EFFFFA") },
          uBot: { value: new THREE.Color("#FFE3F2") },
          uPower: { value: 1.55 },
          uAlpha: { value: 0.22 },
        },
      });
      extraMaterials.add(rimGlowMat);

      const bubbleRimGlow = new THREE.Mesh(mesh.geometry, rimGlowMat);
      bubbleRimGlow.scale.set(1.16, 1.16, 1.16);
      bubbleRimGlow.renderOrder = 12;
      bubbleRimGlow.frustumCulled = false;

      mesh.add(bubbleGlass);
      mesh.add(bubbleRimThin);
      mesh.add(bubbleRimGlow);

      extraMeshes.push(bubbleGlass, bubbleRimThin, bubbleRimGlow);
    };

    const exportOne = async (id: string, doCrop: boolean) => {
      const shapes = shapesRef.current;
      const meshes = meshesRef.current;

      if (!renderer || !scene || !camera || !shapes || !meshes[id]) return;

      const target = meshes[id];

      const camState = {
        pos: camera.position.clone(),
        zoom: camera.zoom,
        left: camera.left,
        right: camera.right,
        top: camera.top,
        bottom: camera.bottom,
      };

      const vis: Array<[THREE.Object3D, boolean]> = [];
      for (const [mid, m] of Object.entries(meshes)) {
        vis.push([m, m.visible]);
        m.visible = mid === id;
      }

      const { w, h, aspect } = getRectSize();
      renderer.setSize(w, h, false);
      setCameraAspect(aspect);

      if (doCrop) fitCameraToObject(target, aspect, 1.22);

      const blob = await capturePngFromRenderTarget({
        renderer,
        scene,
        camera,
        width: w,
        height: h,
        pixelRatio: renderer.getPixelRatio(),
      });

      downloadBlob(`${id}${doCrop ? "-crop" : ""}.png`, blob);

      for (const [o, v] of vis) o.visible = v;

      camera.position.copy(camState.pos);
      camera.zoom = camState.zoom;
      camera.left = camState.left;
      camera.right = camState.right;
      camera.top = camState.top;
      camera.bottom = camState.bottom;
      camera.updateProjectionMatrix();

      renderOnce();
    };

    const exportAll = async (doCrop: boolean) => {
      for (const id of Object.keys(meshesRef.current)) {
        await exportOne(id, doCrop);
        await nextFrame();
      }
    };

    window.__DUARTOIS_EXPORT__ = { exportOne, exportAll };

    const tick = () => {
      if (!mounted) return;
      raf = requestAnimationFrame(tick);
      renderOnce();
    };

    (async () => {
      try {
        await nextFrame();

        const { w, h, aspect } = getRectSize();
        renderer!.setSize(w, h, false);
        setCameraAspect(aspect);

        const initialVariant = createResponsiveHeroVariantState(
          MENU_OVERLAY_MONOGRAM,
          w,
          h,
          MENU_BREAKPOINT,
          MENU_BREAKPOINT
        );

        const shapes = await addDuartoisSignatureShapes(scene!, initialVariant, theme);

        if (!mounted) {
          shapes.dispose?.();
          return;
        }

        // Mantém brilho e cores do seu sistema
        shapes.setBrightness(DEFAULT_BRIGHTNESS);
        shapesRef.current = shapes;

        const meshes = shapes.meshes as Record<string, THREE.Mesh>;
        meshesRef.current = meshes;

        // Aplica bubble rig sem “lavar” o material base (volta cores)
        for (const m of Object.values(meshes)) addBubbleRig(m);

        setIds(Object.keys(meshes));
        setLoading(false);
        setError(null);

        resize();
        window.addEventListener("resize", resize);

        tick();
      } catch (e: any) {
        console.error("[menu-shapes-export] failed:", e);
        if (!mounted) return;
        setError(e?.message ?? "Falha ao carregar shapes.");
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;

      try {
        window.removeEventListener("resize", resize);
      } catch {}

      try {
        cancelAnimationFrame(raf);
      } catch {}

      try {
        delete window.__DUARTOIS_EXPORT__;
      } catch {}

      try {
        extraMeshes.forEach((m) => m.parent?.remove(m));
        extraMaterials.forEach((mat) => mat.dispose());
        extraTextures.forEach((tex) => tex.dispose());
      } catch {}

      try {
        shapesRef.current?.dispose();
        shapesRef.current = null;
      } catch {}

      canvas.removeEventListener("webglcontextlost", onLost as any);

      safeDisposeRenderer();
    };
  }, [canvasKey]);

  const onExportOne = async (id: string) => {
    const api = window.__DUARTOIS_EXPORT__;
    if (!api) return;
    await api.exportOne(id, crop);
  };

  const onExportAll = async () => {
    const api = window.__DUARTOIS_EXPORT__;
    if (!api) return;
    await api.exportAll(crop);
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: previewBg,
        cursor: "auto",
      }}
    >
      {/* Força o cursor padrão nessa rota (mesmo que o AppShell esconda) */}
      <style jsx global>{`
        html,
        body {
          cursor: auto !important;
        }
        a,
        button,
        input,
        label {
          cursor: pointer;
        }
      `}</style>

      {/* “Fog” no preview (não afeta export) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(520px 420px at 52% 44%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.00) 72%),
            radial-gradient(700px 520px at 48% 52%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 70%)
          `,
          filter: "blur(18px)",
          opacity: 1,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1000000,
          background: "rgba(10, 12, 18, 0.55)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 12,
          padding: 12,
          width: 320,
          backdropFilter: "blur(10px)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 600 }}>Exportar formas</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <input type="checkbox" checked={crop} onChange={(e) => setCrop(e.target.checked)} />
            Cortar (crop)
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <button
            onClick={onExportAll}
            disabled={loading || ids.length === 0 || !!error}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {error
              ? "Falha ao carregar"
              : loading
              ? "Carregando..."
              : `Baixar tudo (${crop ? "crop" : "layout"})`}
          </button>

          {error && (
            <>
              <div style={{ marginTop: 10, fontSize: 12, color: "#ffd1d1", lineHeight: 1.35 }}>
                {error}
              </div>

              <button
                onClick={resetWebGL}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(255,255,255,0.16)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Reiniciar WebGL
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: 12, maxHeight: 360, overflow: "auto", paddingRight: 6 }}>
          {ids.map((id) => (
            <div
              key={id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.9 }}>{id}</div>
              <button
                onClick={() => onExportOne(id)}
                disabled={loading || !!error}
                style={{
                  padding: "7px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Baixar
              </button>
            </div>
          ))}

          {!loading && !error && ids.length === 0 && (
            <div style={{ fontSize: 12, opacity: 0.85 }}>Nenhuma forma encontrada.</div>
          )}
        </div>

        <div style={{ marginTop: 10, fontSize: 11, opacity: 0.85, lineHeight: 1.35 }}>
          Export PNG via RenderTarget (transparente). Bubble: glass + rim + haze (cores preservadas).
        </div>
      </div>

      <canvas
        key={canvasKey}
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
