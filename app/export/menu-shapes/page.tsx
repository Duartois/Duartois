"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { addDuartoisSignatureShapes } from "@/components/three/sceneBundle";
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

/**
 * Export com supersampling (render maior + downscale 2D com smoothing high)
 */
async function capturePngFromRenderTarget(opts: {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  width: number;
  height: number;
  pixelRatio: number;
  supersample?: number;
}): Promise<Blob> {
  const { renderer, scene, camera, width, height, pixelRatio } = opts;

  const outW = Math.max(1, Math.floor(width * pixelRatio));
  const outH = Math.max(1, Math.floor(height * pixelRatio));

  const caps = renderer.capabilities as any;
  const maxTex = caps?.maxTextureSize ?? 8192;
  const maxRB = caps?.maxRenderbufferSize ?? maxTex;
  const maxSide = Math.max(1024, Math.min(maxTex, maxRB));

  let ss = opts.supersample ?? 2;
  if (Math.max(outW, outH) >= 8192) ss = Math.min(ss, 1);

  const allowedSSW = Math.floor(maxSide / outW);
  const allowedSSH = Math.floor(maxSide / outH);
  ss = Math.max(1, Math.min(ss, allowedSSW, allowedSSH));

  const rw = Math.max(1, Math.floor(outW * ss));
  const rh = Math.max(1, Math.floor(outH * ss));

  const rt = new THREE.WebGLRenderTarget(rw, rh, {
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

  const buf = new Uint8Array(rw * rh * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, rw, rh, buf);

  renderer.setRenderTarget(prevRT);
  renderer.setClearColor(prevClear, prevAlpha);

  const canvasSrc = document.createElement("canvas");
  canvasSrc.width = rw;
  canvasSrc.height = rh;

  const ctxSrc = canvasSrc.getContext("2d");
  if (!ctxSrc) {
    rt.dispose();
    throw new Error("Falha ao criar canvas 2D para export.");
  }

  const img = ctxSrc.createImageData(rw, rh);
  const row = rw * 4;
  for (let y = 0; y < rh; y++) {
    const srcStart = (rh - 1 - y) * row;
    const dstStart = y * row;
    img.data.set(buf.subarray(srcStart, srcStart + row), dstStart);
  }
  ctxSrc.putImageData(img, 0, 0);

  rt.dispose();

  let canvasOut = canvasSrc;

  if (ss > 1 && (rw !== outW || rh !== outH)) {
    const canvasDst = document.createElement("canvas");
    canvasDst.width = outW;
    canvasDst.height = outH;

    const ctxDst = canvasDst.getContext("2d");
    if (!ctxDst)
      throw new Error("Falha ao criar canvas 2D (downscale) para export.");

    ctxDst.imageSmoothingEnabled = true;
    // @ts-ignore
    ctxDst.imageSmoothingQuality = "high";
    ctxDst.clearRect(0, 0, outW, outH);
    ctxDst.drawImage(canvasSrc, 0, 0, rw, rh, 0, 0, outW, outH);

    canvasOut = canvasDst;
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvasOut.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob retornou null"))),
      "image/png",
    );
  });

  return blob;
}

type ShapesHandle = Awaited<ReturnType<typeof addDuartoisSignatureShapes>>;

export default function MenuShapesPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const shapesRef = useRef<ShapesHandle | null>(null);
  const meshesRef = useRef<Record<string, THREE.Mesh>>({});
  const clusterRef = useRef<THREE.Group | null>(null);

  const [ids, setIds] = useState<string[]>([]);
  const [crop, setCrop] = useState(false);
  const [exportLongEdge, setExportLongEdge] = useState<number>(4096);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [canvasKey, setCanvasKey] = useState(0);
  const resetWebGL = useCallback(() => setCanvasKey((k) => k + 1), []);

  const theme: ThemeName = "light";
  const getToneMappingExposure = (t: ThemeName) => (t === "light" ? 1.1 : 1.5);

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

    const gl2 = canvas.getContext(
      "webgl2",
      attrs,
    ) as WebGL2RenderingContext | null;
    const gl =
      gl2 ||
      (canvas.getContext("webgl", attrs) as WebGLRenderingContext | null) ||
      (canvas.getContext(
        "experimental-webgl",
        attrs,
      ) as WebGLRenderingContext | null);

    if (!gl) {
      setError("Não foi possível criar contexto WebGL.");
      setLoading(false);
      canvas.removeEventListener("webglcontextlost", onLost as any);
      return;
    }

    try {
      const loseExt = gl.getExtension(
        "WEBGL_lose_context",
      ) as unknown as LoseContextExt | null;
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.shadowMap.enabled = false;
      renderer.toneMappingExposure = getToneMappingExposure(theme);
    } catch (e) {
      console.error("[menu-shapes] WebGL init failed:", e);
      setError("Falha ao iniciar WebGL. Clique em “Reiniciar WebGL”.");
      setLoading(false);
      safeDisposeRenderer();
      return;
    }

    scene = new THREE.Scene();

    const cluster = new THREE.Group();
    cluster.name = "EXPORT_CLUSTER";
    scene.add(cluster);
    clusterRef.current = cluster;

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
      const geom = mesh.geometry as THREE.BufferGeometry;
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

    const fitCameraToBox = (
      box: THREE.Box3,
      aspect: number,
      padding = 1.18,
    ) => {
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

    const centerCluster = () => {
      const cluster = clusterRef.current;
      const meshes = meshesRef.current;
      if (!cluster) return;

      for (const m of Object.values(meshes)) cluster.attach(m);

      const box = new THREE.Box3().setFromObject(cluster);
      if (box.isEmpty()) return;

      const center = new THREE.Vector3();
      box.getCenter(center);

      cluster.position.sub(center);
      cluster.updateMatrixWorld(true);
    };

    // ====== Envmap simples p/ realçar borda (não precisa “reflexo entre formas” aqui) ======
    const cubeRT = new THREE.WebGLCubeRenderTarget(256, {
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    cubeRT.texture.colorSpace = THREE.SRGBColorSpace;

    const cubeCam = new THREE.CubeCamera(0.05, 200, cubeRT);
    scene.add(cubeCam);

    const getClusterWorldCenter = () => {
      const c = clusterRef.current;
      if (!c) return new THREE.Vector3(0, 0, 0);
      const box = new THREE.Box3().setFromObject(c);
      const center = new THREE.Vector3();
      if (!box.isEmpty()) box.getCenter(center);
      return center;
    };

    const setFilmsVisible = (visible: boolean) => {
      for (const m of Object.values(meshesRef.current)) {
        const a = m.getObjectByName("__FILM__");
        const b = m.getObjectByName("__INNER_FILM__");
        if (a) a.visible = visible;
        if (b) b.visible = visible;
      }
    };

    const updateEnvMap = () => {
      if (!renderer || !scene) return;
      setFilmsVisible(false);
      cubeCam.position.copy(getClusterWorldCenter());
      cubeCam.update(renderer, scene);
      setFilmsVisible(true);
    };

    // =========================
    // 2 PELÍCULAS (BOLHA FORA + BOLHA DENTRO)
    // =========================
    const FILM_VS = `
      varying vec3 vN;
      varying vec3 vV;
      uniform float uInflate;

      void main() {
        vec3 p = position + normal * uInflate;

        vec4 wPos = modelMatrix * vec4(p, 1.0);
        vec4 mvPos = viewMatrix * wPos;

        vV = normalize(-mvPos.xyz);
        vN = normalize(normalMatrix * normal);

        gl_Position = projectionMatrix * mvPos;
      }
    `;

    const FILM_FS = `
      varying vec3 vN;
      varying vec3 vV;

      uniform samplerCube uEnvMap;

      uniform float uEdgeAlpha;
      uniform float uEdgePower;
      uniform float uFrontKillA;
      uniform float uFrontKillB;
      uniform float uGlow;
      uniform float uHueShift;

      uniform float uEnvIntensity;
      uniform float uReflPower;
      uniform float uReflTint;
      uniform float uSpecFloor;

      float sat(float x){ return clamp(x, 0.0, 1.0); }

      vec3 cosinePalette(float t, vec3 a, vec3 b, vec3 c, vec3 d){
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec3 N = normalize(vN);
        vec3 V = normalize(vV);

        float ndv = sat(dot(N, V));
        float fres = pow(1.0 - ndv, uEdgePower);

        float frontKill = smoothstep(uFrontKillA, uFrontKillB, ndv);
        float edge = fres * (1.0 - frontKill);

        float t = sat(edge * 1.10 + (1.0 - ndv) * 0.42 + uHueShift);

        vec3 ir = cosinePalette(
          t,
          vec3(0.54, 0.64, 0.96),
          vec3(0.46, 0.34, 0.26),
          vec3(1.00, 1.00, 1.00),
          vec3(0.03, 0.13, 0.25)
        );

        vec3 R = reflect(-V, N);
        vec3 env = textureCube(uEnvMap, R).rgb;

        float reflF = pow(1.0 - ndv, uReflPower);
        vec3 refl = env * (uEnvIntensity * (0.35 + 0.65 * reflF));
        refl = mix(refl, refl * vec3(0.85, 0.95, 1.10), uReflTint);

        vec3 glow = vec3(0.70, 0.82, 1.00) * pow(edge, 1.55) * uGlow;

        vec3 col = ir * (0.55 + 0.45 * edge) + glow + refl;

        float a = edge * uEdgeAlpha;
        a *= (1.0 - frontKill);
        a = max(a, uSpecFloor * reflF);

        gl_FragColor = vec4(col, sat(a));
      }
    `;

    const outerFilmMat = new THREE.ShaderMaterial({
      vertexShader: FILM_VS,
      fragmentShader: FILM_FS,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      uniforms: {
        uInflate: { value: 0.165 },
        uEdgeAlpha: { value: 1.05 },
        uEdgePower: { value: 2.55 },
        uFrontKillA: { value: 0.7 },
        uFrontKillB: { value: 0.95 },
        uGlow: { value: 1.25 },
        uHueShift: { value: 0.14 },
        uEnvMap: { value: cubeRT.texture },
        uEnvIntensity: { value: 1.35 },
        uReflPower: { value: 2.15 },
        uReflTint: { value: 0.55 },
        uSpecFloor: { value: 0.018 },
      },
    });

    const innerFilmMat = new THREE.ShaderMaterial({
      vertexShader: FILM_VS,
      fragmentShader: FILM_FS,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      side: THREE.BackSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      uniforms: {
        uInflate: { value: -0.085 },
        uEdgeAlpha: { value: 0.72 }, // mais presente pra aparecer bem
        uEdgePower: { value: 2.25 },
        uFrontKillA: { value: 0.62 },
        uFrontKillB: { value: 0.92 },
        uGlow: { value: 0.85 },
        uHueShift: { value: 0.1 },
        uEnvMap: { value: cubeRT.texture },
        uEnvIntensity: { value: 1.05 },
        uReflPower: { value: 2.05 },
        uReflTint: { value: 0.5 },
        uSpecFloor: { value: 0.012 },
      },
    });

    const filmGeomCache = new WeakMap<
      THREE.BufferGeometry,
      THREE.BufferGeometry
    >();
    const filmGeomList: THREE.BufferGeometry[] = [];

    const getFilmGeometry = (src: THREE.BufferGeometry) => {
      const cached = filmGeomCache.get(src);
      if (cached) return cached;

      let g = src.clone();
      g = mergeVertices(g, 1e-4);
      g.computeVertexNormals();
      g.computeBoundingSphere?.();
      g.computeBoundingBox?.();

      filmGeomCache.set(src, g);
      filmGeomList.push(g);
      return g;
    };

    const ensureBubbleInsideBubble = (mesh: THREE.Mesh) => {
      const base = mesh.geometry as THREE.BufferGeometry;
      if (!base.attributes.normal) base.computeVertexNormals();

      // Miolo: quase invisível, só “linha” nas bordas (vidro dentro de vidro)
      const applyDimFill = (mat: any) => {
        if (!mat) return;

        mat.transparent = true;

        // ALPHA ABSOLUTO (bem mais transparente que 0.12)
        mat.opacity = 0.03; // teste 0.02 se ainda estiver forte

        // vidro “limpo”
        if ("transmission" in mat) mat.transmission = 1.0;
        if ("ior" in mat) mat.ior = 1.45;
        if ("thickness" in mat) mat.thickness = 0.25;
        if ("roughness" in mat)
          mat.roughness = Math.min(mat.roughness ?? 0.2, 0.06);
        if ("metalness" in mat) mat.metalness = 0;

        // não escrever depth ajuda a não “chapar” o miolo
        mat.depthWrite = false;
        mat.colorWrite = true;
        if ("alphaTest" in mat) mat.alphaTest = 0;

        // Fresnel no alpha: centro quase some, borda aparece (separação)
        if (!mat.__MIoloFresnelAlpha__) {
          mat.__MIoloFresnelAlpha__ = true;
          mat.onBeforeCompile = (shader: any) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              `#include <output_fragment>`,
              `
          // Fresnel alpha (borda)
          float ndv = clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0);
          float fres = pow(1.0 - ndv, 3.0);

          // centro ~0, borda aumenta um pouco (separação)
          gl_FragColor.a *= (0.02 + fres * 0.35);

          #include <output_fragment>
        `,
            );
          };
        }

        mat.needsUpdate = true;
      };

      const mat = mesh.material as any;
      if (Array.isArray(mat)) for (const m of mat) applyDimFill(m);
      else applyDimFill(mat);

      const filmGeom = getFilmGeometry(base);

      if (!mesh.getObjectByName("__INNER_FILM__")) {
        const inner = new THREE.Mesh(filmGeom, innerFilmMat);
        inner.name = "__INNER_FILM__";
        inner.frustumCulled = false;
        inner.renderOrder = (mesh.renderOrder ?? 0) + 9;
        mesh.add(inner);
      }

      if (!mesh.getObjectByName("__FILM__")) {
        const outer = new THREE.Mesh(filmGeom, outerFilmMat);
        outer.name = "__FILM__";
        outer.frustumCulled = false;
        outer.renderOrder = (mesh.renderOrder ?? 0) + 10;
        mesh.add(outer);
      }
    };

    const buildBubbles = () => {
      for (const m of Object.values(meshesRef.current))
        ensureBubbleInsideBubble(m);
    };

    const renderOnce = () => {
      if (!renderer || !scene || !camera) return;
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, true);
      renderer.render(scene, camera);
    };

    const resize = () => {
      if (!renderer || !camera) return;
      const { w, h, aspect } = getRectSize();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
      setCameraAspect(aspect);

      applyVariant(w, h);
      centerCluster();
      buildBubbles();

      updateEnvMap();
      renderOnce();
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

      centerCluster();
      buildBubbles();

      const { w, h, aspect } = getRectSize();
      renderer.setSize(w, h, false);
      setCameraAspect(aspect);

      if (doCrop) {
        const box = new THREE.Box3();
        expandBoxByMeshGeometry(box, target);
        fitCameraToBox(box, aspect, 1.18);
      }

      updateEnvMap();

      const caps = renderer.capabilities as any;
      const maxTex = caps?.maxTextureSize ?? 8192;
      const maxRB = caps?.maxRenderbufferSize ?? maxTex;
      const longEdge = Math.min(exportLongEdge, maxTex, maxRB);
      const pr = Math.max(1, longEdge / Math.max(w, h));

      const blob = await capturePngFromRenderTarget({
        renderer,
        scene,
        camera,
        width: w,
        height: h,
        pixelRatio: pr,
        supersample: 2,
      });

      for (const [o, v] of vis) o.visible = v;

      camera.position.copy(camState.pos);
      camera.zoom = camState.zoom;
      camera.left = camState.left;
      camera.right = camState.right;
      camera.top = camState.top;
      camera.bottom = camState.bottom;
      camera.updateProjectionMatrix();

      updateEnvMap();
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
      for (const id of keys) {
        const blob = await renderOneToBlob(id, doCrop);
        if (!blob) continue;
        downloadBlob(`${id}${doCrop ? "-crop" : ""}.png`, blob);
        await sleep(120);
      }
    };

    window.__DUARTOIS_EXPORT__ = { exportOne, exportAll };

    const tick = () => {
      if (!mounted) return;
      raf = requestAnimationFrame(tick);
      updateEnvMap();
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

        const shapes = await addDuartoisSignatureShapes(
          scene!,
          initialVariant,
          theme,
        );
        if (!mounted) {
          shapes.dispose?.();
          return;
        }

        shapes.setBrightness(DEFAULT_BRIGHTNESS);
        shapesRef.current = shapes;

        const meshes = shapes.meshes as Record<string, THREE.Mesh>;
        meshesRef.current = meshes;

        setIds(Object.keys(meshes));
        setLoading(false);
        setError(null);

        centerCluster();
        buildBubbles();
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
        shapesRef.current?.dispose();
        shapesRef.current = null;
      } catch {}

      try {
        outerFilmMat.dispose();
      } catch {}
      try {
        innerFilmMat.dispose();
      } catch {}
      try {
        cubeRT.dispose();
      } catch {}
      try {
        for (const g of filmGeomList) g.dispose();
      } catch {}

      try {
        clusterRef.current?.clear();
        clusterRef.current = null;
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
        background: "#45495b",
        cursor: "auto",
      }}
    >
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
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <div style={{ fontWeight: 600 }}>Exportar bolhas</div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
            }}
          >
            <input
              type="checkbox"
              checked={crop}
              onChange={(e) => setCrop(e.target.checked)}
            />
            Crop
          </label>
        </div>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.9, minWidth: 78 }}>
            Resolução
          </div>
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
            <option value={2048}>2048 px</option>
            <option value={4096}>4096 px</option>
            <option value={8192}>8192 px</option>
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
            {error
              ? "Falha ao carregar"
              : loading
                ? "Carregando..."
                : `Baixar tudo (${crop ? "crop" : "layout"})`}
          </button>

          {error && (
            <>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#ffd1d1",
                  lineHeight: 1.35,
                }}
              >
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

        <div
          style={{
            marginTop: 12,
            maxHeight: 360,
            overflow: "auto",
            paddingRight: 6,
          }}
        >
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
