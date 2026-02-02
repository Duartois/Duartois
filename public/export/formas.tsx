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

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** --------- Outline “bubble metal” (1 mesh apenas) --------- */
const OUTLINE_VS = `
  varying vec3 vWPos;
  varying vec3 vWNorm;

  void main() {
    vec4 wPos = modelMatrix * vec4(position, 1.0);
    vWPos = wPos.xyz;
    vWNorm = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wPos;
  }
`;

const OUTLINE_FS = `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  uniform vec3 uWhite;
  uniform vec3 uTint;

  uniform float uPower;
  uniform float uAlpha;
  uniform float uInner;
  uniform float uOuter;
  uniform float uIriMix;

  varying vec3 vWPos;
  varying vec3 vWNorm;

  void main() {
    vec3 N = normalize(vWNorm);
    vec3 V = normalize(cameraPosition - vWPos);

    float ndv = clamp(dot(N, V), 0.0, 1.0);
    float edge = pow(1.0 - ndv, uPower);

    // banda do outline (mais “bubble”)
    float band = smoothstep(uInner, uOuter, edge);
    band = smoothstep(0.0, 1.0, band);

    float up = clamp(N.y * 0.5 + 0.5, 0.0, 1.0);
    float side = clamp(N.x * 0.5 + 0.5, 0.0, 1.0);

    vec3 iri = mix(uA, uB, up);
    iri = mix(iri, uC, side * 0.65);

    // cor do outline (apenas contorno)
    vec3 col = mix(uWhite, iri, uIriMix);

    // “reflexo”/glint leve e esverdeado
    vec3 R = reflect(-V, N);
    float glint = pow(clamp(dot(R, normalize(vec3(0.18, 0.72, 0.62))), 0.0, 1.0), 18.0);
    col += uTint * glint * 0.28;

    // leve viés verde (só no outline)
    col *= uTint;

    gl_FragColor = vec4(col * band, band * uAlpha);
  }
`;

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

  // MSAA (WebGL2)
  try {
    const maxSamples = (renderer.capabilities as any).maxSamples ?? 0;
    (rt as any).samples = Math.min(4, maxSamples);
  } catch {}

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
    canvas2d.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob retornou null"))), "image/png");
  });

  return blob;
}

type ShapesHandle = Awaited<ReturnType<typeof addDuartoisSignatureShapes>>;

export default function MenuShapesPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const shapesRef = useRef<ShapesHandle | null>(null);
  const meshesRef = useRef<Record<string, THREE.Mesh>>({});

  const [ids, setIds] = useState<string[]>([]);
  const [crop, setCrop] = useState(false);
  const [exportLongEdge, setExportLongEdge] = useState<number>(4096);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [canvasKey, setCanvasKey] = useState(0);
  const resetWebGL = useCallback(() => setCanvasKey((k) => k + 1), []);

  const theme: ThemeName = "light";

  const previewBg = useMemo(
    () =>
      [
        "radial-gradient(860px 620px at 50% 46%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 28%, rgba(255,255,255,0.00) 64%)",
        "radial-gradient(980px 720px at 50% 50%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.00) 60%)",
        "radial-gradient(780px 560px at 50% 44%, rgba(255,255,255,0.06) 0%, rgba(130,140,175,0.22) 28%, rgba(84,92,120,0.70) 62%, rgba(58,64,88,0.94) 100%)",
      ].join(","),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let mounted = true;
    let raf = 0;

    setLoading(true);
    setError(null);

    try {
      loseOldWebGLContexts();
    } catch {}

    const onLost = (e: Event) => {
      e.preventDefault();
      if (!mounted) return;
      setError("WebGL context lost. Clique em “Reiniciar WebGL”.");
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
    const extraGeometries = new Set<THREE.BufferGeometry>();
    let envRT: THREE.WebGLRenderTarget | null = null;

    const safeDisposeRenderer = () => {
      try {
        renderer?.renderLists?.dispose?.();
        renderer?.dispose();
        renderer?.forceContextLoss?.();
      } catch {}
    };

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
      setError("Não foi possível criar contexto WebGL. Feche abas com WebGL / reinicie o navegador / teste aba anônima.");
      setLoading(false);
      canvas.removeEventListener("webglcontextlost", onLost as any);
      return;
    }

    try {
      const loseExt = gl.getExtension("WEBGL_lose_context") as unknown as LoseContextExt | null;
      if (loseExt) {
        window.__DUARTOIS_GL_LOSERS__ ??= [];
        window.__DUARTOIS_GL_LOSERS__.push(loseExt);
      }
    } catch {}

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

      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
    } catch (e) {
      console.error("[menu-shapes] WebGL init failed:", e);
      setError("Falha ao iniciar WebGL. Clique em “Reiniciar WebGL”.");
      setLoading(false);
      safeDisposeRenderer();
      return;
    }

    scene = new THREE.Scene();

    // env leve (ajuda o look “refletivo” do conjunto, sem mexer na cor base)
    const makeEnvEquirect = () => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      const g = ctx.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0.0, "#ffffff");
      g.addColorStop(0.42, "#8ec2ff");
      g.addColorStop(0.76, "#ff9fd3");
      g.addColorStop(1.0, "#ffffff");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.globalCompositeOperation = "screen";
      const h = ctx.createRadialGradient(c.width * 0.62, c.height * 0.38, 10, c.width * 0.62, c.height * 0.38, 180);
      h.addColorStop(0, "rgba(210,255,235,0.52)"); // ✅ viés verde no highlight do env
      h.addColorStop(1, "rgba(255,255,255,0.0)");
      ctx.fillStyle = h;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = "source-over";

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.needsUpdate = true;
      extraTextures.add(tex);
      return tex;
    };

    try {
      const envTex = makeEnvEquirect();
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      envRT = pmrem.fromEquirectangular(envTex);
      pmrem.dispose();
      envTex.dispose();
      scene.environment = envRT.texture;
    } catch {}

    camera = createCamera() as THREE.OrthographicCamera;
    camera.position.set(0, 0, 15);
    camera.near = 0.1;
    camera.far = 100;
    camera.layers.enableAll();
    camera.updateProjectionMatrix();
    scene.add(camera);

    const setCameraAspect = (aspect: number) => {
      if (!camera) return;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    };

    const expandBoxByMeshGeometry = (box: THREE.Box3, mesh: THREE.Mesh) => {
      const geom = mesh.geometry;
      if (!geom.boundingBox) geom.computeBoundingBox();
      const bb = geom.boundingBox;
      if (!bb) return;

      mesh.updateWorldMatrix(true, false);

      const min = bb.min;
      const max = bb.max;

      const pts = [
        new THREE.Vector3(min.x, min.y, min.z),
        new THREE.Vector3(min.x, min.y, max.z),
        new THREE.Vector3(min.x, max.y, min.z),
        new THREE.Vector3(min.x, max.y, max.z),
        new THREE.Vector3(max.x, min.y, min.z),
        new THREE.Vector3(max.x, min.y, max.z),
        new THREE.Vector3(max.x, max.y, min.z),
        new THREE.Vector3(max.x, max.y, max.z),
      ];

      for (const p of pts) {
        p.applyMatrix4(mesh.matrixWorld);
        box.expandByPoint(p);
      }
    };

    const fitCameraToBox = (box: THREE.Box3, aspect: number, padding = 1.34) => {
      if (!camera) return;
      if (box.isEmpty()) return;

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
        MENU_BREAKPOINT,
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

      const meshes = meshesRef.current;
      const baseBox = new THREE.Box3();
      for (const m of Object.values(meshes)) expandBoxByMeshGeometry(baseBox, m);
      fitCameraToBox(baseBox, aspect, 1.34);

      renderOnce();
    };

    // --- texturas leves (shadow + spec) ---
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
      [0.0, "rgba(0,0,0,0.26)"],
      [0.55, "rgba(0,0,0,0.11)"],
      [1.0, "rgba(0,0,0,0.0)"],
    ]);

    const makeSpecTex = () => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);

      ctx.save();
      ctx.translate(c.width * 0.56, c.height * 0.44);
      ctx.rotate(-0.35);
      const g = ctx.createLinearGradient(-260, 0, 260, 0);
      g.addColorStop(0.0, "rgba(255,255,255,0.0)");
      g.addColorStop(0.46, "rgba(210,255,235,0.08)"); // ✅ verde suave
      g.addColorStop(0.5, "rgba(210,255,235,0.26)");
      g.addColorStop(0.54, "rgba(210,255,235,0.08)");
      g.addColorStop(1.0, "rgba(255,255,255,0.0)");
      ctx.fillStyle = g;
      ctx.fillRect(-280, -26, 560, 52);
      ctx.restore();

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      extraTextures.add(tex);
      return tex;
    };

    const specTex = makeSpecTex();

    const addSoftShadow = (mesh: THREE.Mesh) => {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      const bb = mesh.geometry.boundingBox;
      if (!bb) return;

      const w = Math.max(0.001, bb.max.x - bb.min.x);
      const h = Math.max(0.001, bb.max.y - bb.min.y);

      const mat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        depthTest: false,
      });
      extraMaterials.add(mat);

      const geo = new THREE.PlaneGeometry(1, 1);
      extraGeometries.add(geo);

      const plane = new THREE.Mesh(geo, mat);
      plane.scale.set(w * 1.9, h * 1.9, 1);
      plane.position.set(0, 0, -0.55);
      plane.renderOrder = -20;

      mesh.add(plane);
      extraMeshes.push(plane);
    };

    const addSpecHighlight = (mesh: THREE.Mesh) => {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      const bb = mesh.geometry.boundingBox;
      if (!bb) return;

      const w = Math.max(0.001, bb.max.x - bb.min.x);
      const h = Math.max(0.001, bb.max.y - bb.min.y);

      const mat = new THREE.MeshBasicMaterial({
        map: specTex,
        color: new THREE.Color("#cffff0"), // ✅ leve verde
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });
      extraMaterials.add(mat);

      const geo = new THREE.PlaneGeometry(1, 1);
      extraGeometries.add(geo);

      const spec = new THREE.Mesh(geo, mat);
      spec.scale.set(w * 1.05, h * 0.82, 1);
      spec.position.set(w * 0.02, h * 0.12, 0.55);
      spec.rotation.set(0, 0, -0.35);
      spec.renderOrder = 20;

      mesh.add(spec);
      extraMeshes.push(spec);
    };

    // --- inflate controlado (mais bubble) ---
    const __SPHERE = new THREE.Sphere();
    const computeOutlineAmount = (bb: THREE.Box3) => {
      bb.getBoundingSphere(__SPHERE);
      // ✅ um pouco mais “espesso” que antes
      return Math.max(0.0012, __SPHERE.radius * 0.018);
    };

    const inflateGeometry = (src: THREE.BufferGeometry, amount: number) => {
      const g = src.clone();
      if (!g.attributes.normal) g.computeVertexNormals();

      const pos = g.attributes.position as THREE.BufferAttribute | undefined;
      const nor = g.attributes.normal as THREE.BufferAttribute | undefined;
      if (!pos || !nor) return g;

      const pa: any = pos.array;
      const na: any = nor.array;

      if (pa && na && pa.length === na.length) {
        for (let i = 0; i < pa.length; i += 3) {
          pa[i + 0] += na[i + 0] * amount;
          pa[i + 1] += na[i + 1] * amount;
          pa[i + 2] += na[i + 2] * amount;
        }
        pos.needsUpdate = true;
      } else {
        for (let i = 0; i < pos.count; i++) {
          pos.setXYZ(
            i,
            pos.getX(i) + nor.getX(i) * amount,
            pos.getY(i) + nor.getY(i) * amount,
            pos.getZ(i) + nor.getZ(i) * amount,
          );
        }
        pos.needsUpdate = true;
      }

      g.computeVertexNormals();
      g.computeBoundingBox();
      g.computeBoundingSphere();
      return g;
    };

    const __HSL = { h: 0, s: 0, l: 0 };
    const makeIriFromBase = (base: THREE.Color) => {
      const b = base.clone();
      b.getHSL(__HSL);

      const s = Math.max(0.66, Math.min(1.0, __HSL.s * 1.5));
      const l = Math.max(0.56, Math.min(0.80, __HSL.l * 1.1));
      const h = __HSL.h;

      const c1 = new THREE.Color().setHSL((h + 0.06) % 1, s, l);
      const c2 = new THREE.Color().setHSL((h + 0.00) % 1, s, l);
      const c3 = new THREE.Color().setHSL((h - 0.06 + 1) % 1, s, l);

      return { c1, c2, c3 };
    };

    const addBubbleOutline = (mesh: THREE.Mesh) => {
      // ✅ não altera o material base (fill intacto)
      addSoftShadow(mesh);
      addSpecHighlight(mesh);

      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      const bb = mesh.geometry.boundingBox;
      if (!bb) return;

      const amt = computeOutlineAmount(bb);

      // ✅ ligeiramente mais “inflado” = bubble mais presente
      const outlineGeo = inflateGeometry(mesh.geometry, amt * 1.55);
      extraGeometries.add(outlineGeo);

      const baseCol = (() => {
        const mat: any = mesh.material;
        return mat?.color?.clone?.() ?? new THREE.Color("#ffffff");
      })();

      const iri = makeIriFromBase(baseCol);

      const outlineMat = new THREE.ShaderMaterial({
        vertexShader: OUTLINE_VS,
        fragmentShader: OUTLINE_FS,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
        uniforms: {
          uA: { value: iri.c1 },
          uB: { value: iri.c2 },
          uC: { value: iri.c3 },
          uWhite: { value: new THREE.Color("#f6fffb") }, // ✅ branco levemente “mint”
          uTint: { value: new THREE.Color("#c8ffe4") },  // ✅ reflexo esverdeado

          // ✅ mais bubble + mais transparente
          uPower: { value: 1.85 }, // menor = banda mais larga
          uAlpha: { value: 0.36 }, // mais transparente
          uInner: { value: 0.18 }, // começa antes (banda maior)
          uOuter: { value: 0.96 },
          uIriMix: { value: 0.90 }, // cor forte só no contorno
        },
      });
      extraMaterials.add(outlineMat);

      const outline = new THREE.Mesh(outlineGeo, outlineMat);
      outline.renderOrder = 12;
      outline.frustumCulled = false;

      mesh.add(outline);
      extraMeshes.push(outline);
    };

    const renderOneToBlob = async (id: string, doCrop: boolean) => {
      const shapes = shapesRef.current;
      const meshes = meshesRef.current;

      if (!renderer || !scene || !camera || !shapes || !meshes[id]) return null;

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

      if (doCrop) {
        const box = new THREE.Box3();
        expandBoxByMeshGeometry(box, target);
        fitCameraToBox(box, aspect, 1.18);
      }

      const maxTex = (renderer.capabilities as any).maxTextureSize ?? 8192;
      const longEdge = Math.min(exportLongEdge, maxTex);
      const pr = Math.max(1, longEdge / Math.max(w, h));

      const blob = await capturePngFromRenderTarget({
        renderer,
        scene,
        camera,
        width: w,
        height: h,
        pixelRatio: pr,
      });

      for (const [o, v] of vis) o.visible = v;

      camera.position.copy(camState.pos);
      camera.zoom = camState.zoom;
      camera.left = camState.left;
      camera.right = camState.right;
      camera.top = camState.top;
      camera.bottom = camState.bottom;
      camera.updateProjectionMatrix();

      renderOnce();
      return blob;
    };

    const exportOne = async (id: string, doCrop: boolean) => {
      const blob = await renderOneToBlob(id, doCrop);
      if (!blob) return;
      downloadBlob(`${id}${doCrop ? "-crop" : ""}.png`, blob);
    };

    const exportAll = async (doCrop: boolean) => {
      const keys = Object.keys(meshesRef.current);
      if (!keys.length) return;
      for (const id of keys) {
        const blob = await renderOneToBlob(id, doCrop);
        if (!blob) continue;
        downloadBlob(`${id}${doCrop ? "-crop" : ""}.png`, blob);
        await sleep(140);
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
          MENU_BREAKPOINT,
        );

        const shapes = await addDuartoisSignatureShapes(scene!, initialVariant, theme);

        if (!mounted) {
          shapes.dispose?.();
          return;
        }

        // ✅ mantém cores originais (sem desaturar)
        shapes.setBrightness(DEFAULT_BRIGHTNESS);

        shapesRef.current = shapes;

        const meshes = shapes.meshes as Record<string, THREE.Mesh>;
        meshesRef.current = meshes;

        // ✅ apenas: sombra + spec + 1 outline
        for (const m of Object.values(meshes)) addBubbleOutline(m);

        setIds(Object.keys(meshes));
        setLoading(false);
        setError(null);

        resize();
        window.addEventListener("resize", resize);

        tick();
      } catch (e: any) {
        console.error("[menu-shapes] failed:", e);
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
        extraGeometries.forEach((g) => g.dispose());
        envRT?.dispose?.();
      } catch {}

      try {
        shapesRef.current?.dispose();
        shapesRef.current = null;
      } catch {}

      canvas.removeEventListener("webglcontextlost", onLost as any);
      safeDisposeRenderer();
    };
  }, [canvasKey, exportLongEdge]);

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
      id="menu-shapes-export"
      ref={wrapRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: previewBg,
        cursor: "auto",
      }}
    >
      {/* Cursor visível nessa rota */}
      <style jsx global>{`
        :root,
        html,
        body {
          cursor: auto !important;
        }
        body #menu-shapes-export,
        body #menu-shapes-export * {
          cursor: auto !important;
        }
        body #menu-shapes-export button,
        body #menu-shapes-export a,
        body #menu-shapes-export label,
        body #menu-shapes-export select,
        body #menu-shapes-export input[type="checkbox"] {
          cursor: pointer !important;
        }
        body #menu-shapes-export canvas {
          cursor: auto !important;
        }
      `}</style>

      {/* Painel */}
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
          width: 340,
          backdropFilter: "blur(10px)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 600 }}>Exportar formas</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <input type="checkbox" checked={crop} onChange={(e) => setCrop(e.target.checked)} />
            Crop
          </label>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, opacity: 0.9, minWidth: 78 }}>Resolução</div>
          <select
            value={exportLongEdge}
            onChange={(e) => setExportLongEdge(Number(e.target.value))}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.10)",
              color: "#fff",
              outline: "none",
            }}
          >
            <option value={2048}>2048 px (rápido)</option>
            <option value={4096}>4096 px (alta)</option>
            <option value={8192}>8192 px (máxima)</option>
          </select>
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
            {error ? "Falha ao carregar" : loading ? "Carregando..." : `Salvar/baixar tudo (${crop ? "crop" : "layout"})`}
          </button>

          {error && (
            <>
              <div style={{ marginTop: 10, fontSize: 12, color: "#ffd1d1", lineHeight: 1.35 }}>{error}</div>

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

          {!loading && !error && ids.length === 0 && <div style={{ fontSize: 12, opacity: 0.85 }}>Nenhuma forma encontrada.</div>}
        </div>

        <div style={{ marginTop: 10, fontSize: 11, opacity: 0.85, lineHeight: 1.35 }}>
          Export PNG em alta resolução (long edge). Para formas “maiores” no arquivo final, habilite <b>Crop</b>.
        </div>
      </div>

      <canvas key={canvasKey} ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
