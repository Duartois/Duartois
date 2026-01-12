import * as THREE from "three";
import {
  attachToWindow,
  detachFromWindow,
  dispatchReady,
  dispatchStateChange,
  createStateSnapshot,
} from "./debug-helpers";
import {
  DEFAULT_BRIGHTNESS,
  type GradientPalette,
  type ShapeId,
  type StateUpdater,
  type ThreeAppHandle,
  type ThreeAppState,
  type ThemeName,
  type VariantName,
  createVariantState,
  createResponsiveVariantState,
  getDefaultPalette,
  variantMapping,
} from "./types";
import { createCamera, ensurePalette } from "./factories";
import { addDuartoisSignatureShapes } from "@/components/three/addShapes";

export type InitSceneOptions = {
  canvas: HTMLCanvasElement;
  initialVariant?: VariantName;
  theme: ThemeName;
  palette?: GradientPalette;
  parallax?: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const getToneMappingExposure = (theme: ThemeName) =>
  theme === "light" ? 1.1 : 1.5;

const resolveWindow = () =>
  (typeof window === "undefined" ? null : window);

export const initScene = async ({
  canvas,
  initialVariant = "home",
  theme,
  palette,
  parallax = true,
}: InitSceneOptions): Promise<ThreeAppHandle> => {
  const globalWindow = resolveWindow();

  if (!globalWindow) {
    throw new Error("initScene requires a browser environment");
  }

  globalWindow.__THREE_APP__?.dispose();

  const mobileQuery = globalWindow.matchMedia("(max-width: 768px)");
  let isMobile = mobileQuery.matches;
  const handleMobileChange = (event: MediaQueryListEvent) => {
    isMobile = event.matches;
  };
  mobileQuery.addEventListener("change", handleMobileChange);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  const gl = renderer.getContext();

  if (!gl) {
    throw new Error("Failed to acquire WebGL context");
  }

  const originalGetShaderInfoLog = gl.getShaderInfoLog.bind(gl) as (
    shader: WebGLShader | null,
  ) => string | null;
  const originalGetProgramInfoLog = gl.getProgramInfoLog.bind(gl) as (
    program: WebGLProgram | null,
  ) => string | null;

  gl.getShaderInfoLog = ((shader) =>
    originalGetShaderInfoLog(shader) ?? "") as typeof gl.getShaderInfoLog;
  gl.getProgramInfoLog = ((program) =>
    originalGetProgramInfoLog(program) ?? "") as typeof gl.getProgramInfoLog;

  renderer.setClearColor(new THREE.Color("#000000"), 0);
  // === pastel/filmic renderer ===
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // menos brilho no tema claro, levemente mais no escuro
  renderer.toneMappingExposure = getToneMappingExposure(theme);
  // sombras desligadas para evitar contorno duro
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = createCamera();
  scene.add(camera);

  const effectivePalette = ensurePalette(palette, theme);
  const baseVariantTemplate = variantMapping[initialVariant];
  const initialVariantState = createResponsiveVariantState(
    baseVariantTemplate,
    globalWindow.innerWidth,
    globalWindow.innerHeight,
  );
  const shapes = await addDuartoisSignatureShapes(
    scene,
    initialVariantState,
    theme,
  );
  shapes.setBrightness(DEFAULT_BRIGHTNESS);
  const shapesGroup = shapes.group;
  const baseGroupZ = shapesGroup.position.z;
  const shapeIds = Object.keys(shapes.meshes) as ShapeId[];
  const initialShapeOpacity = shapeIds.reduce(
    (acc, id) => {
      acc[id] = 1;
      return acc;
    },
    {} as Record<ShapeId, number>,
  );
  const initialVariantClone = createVariantState(initialVariantState);
  let targetVariantState = initialVariantClone;
  type MaterialWithOpacity = THREE.Material & {
    opacity: number;
    transparent: boolean;
  };

  const hasOpacity = (material: THREE.Material): material is MaterialWithOpacity =>
    "opacity" in material && "transparent" in material;

  const applyOpacityToMaterial = (material: THREE.Material, opacity: number) => {
    if (!hasOpacity(material)) {
      return;
    }

    material.opacity = opacity;
    material.transparent = opacity < 1 ? true : material.transparent;
    material.needsUpdate = true;
  };

  const applyOpacityToMesh = (mesh: THREE.Mesh, opacity: number) => {
    const material = mesh.material;

    if (Array.isArray(material)) {
      material.forEach((mat) => applyOpacityToMaterial(mat, opacity));
      return;
    }

    applyOpacityToMaterial(material, opacity);
  };

  const updateAllMeshOpacities = (
    globalOpacity: number,
    shapeOpacity: Record<ShapeId, number>,
  ) => {
    shapeIds.forEach((id) => {
      const mesh = shapes.meshes[id];
      const combinedOpacity = clamp(globalOpacity * shapeOpacity[id], 0, 1);
      applyOpacityToMesh(mesh, combinedOpacity);
    });
  };
  const initialState: ThreeAppState = {
    variantName: initialVariant,
    variant: createVariantState(initialVariantClone),
    hoverVariants: null,
    palette: effectivePalette,
    theme,
    parallax,
    hovered: false,
    cursorBoost: 0,
    pointer: { x: 0, y: 0 },
    pointerDriver: "device",
    manualPointer: { x: 0, y: 0 },
    opacity: 1,
    shapeOpacity: { ...initialShapeOpacity },
    brightness: DEFAULT_BRIGHTNESS,
    ready: false,
  };

  updateAllMeshOpacities(initialState.opacity, initialState.shapeOpacity);

  const eventTarget = new EventTarget();

  let state = initialState;
  let shapeOpacityState = { ...initialShapeOpacity };
  const pointer = new THREE.Vector2();
  const devicePointerTarget = new THREE.Vector2();
  const manualPointerTarget = new THREE.Vector2();

  devicePointerTarget.set(initialState.pointer.x, initialState.pointer.y);
  manualPointerTarget.set(
    initialState.manualPointer.x,
    initialState.manualPointer.y,
  );

  const clock = new THREE.Clock();
  let isVisible = !globalWindow.document.hidden;
  let readyDispatched = false;
  let animationId: number | null = null;
  let disposed = false;
  const pointerListenerOptions = { passive: true } as const;

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (height === 0) {
      return;
    }

    if (canvas.width !== width || canvas.height !== height) {
      renderer.setPixelRatio(Math.min(globalWindow.devicePixelRatio, 1.8));
      renderer.setSize(width, height, false);
    }

    // ortho frustum: top/bottom fixos e left/right por aspecto
    const aspect = width / height;
    const ortho = camera as unknown as THREE.OrthographicCamera;
    ortho.left = -aspect;
    ortho.right = aspect;
    ortho.top = 1;
    ortho.bottom = -1;
    ortho.updateProjectionMatrix();

    setState((previous) => ({
      variant: createResponsiveVariantState(
        variantMapping[previous.variantName],
        width,
        height,
      ),
    }));
  };


  const pointerMove = (event: PointerEvent) => {
    const width = globalWindow.innerWidth;
    const height = globalWindow.innerHeight;
    const x = (event.clientX / width) * 2 - 1;
    const y = -((event.clientY / height) * 2 - 1);
    devicePointerTarget.set(x, y);
    if (state.pointerDriver === "device") {
      state = {
        ...state,
        pointer: { x, y },
      };
    }
  };

  const pointerEnter = () => {
    setState({ hovered: true });
  };

  const pointerLeave = () => {
    setState({ hovered: false });
  };

  const tick = () => {
    if (disposed) {
      return;
    }

    if (!isVisible) {
      animationId = null;
      return;
    }

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    const variantLerp = clamp(delta * (state.hovered ? 7 : 5), 0, 1);
    if (variantLerp > 0) {
      shapeIds.forEach((id) => {
        const mesh = shapes.meshes[id];
        const target = targetVariantState[id];
        if (!target) {
          return;
        }

        const [tx, ty, tz] = target.position;
        mesh.position.x += (tx - mesh.position.x) * variantLerp;
        mesh.position.y += (ty - mesh.position.y) * variantLerp;
        mesh.position.z += (tz - mesh.position.z) * variantLerp;

        const [rx, ry, rz] = target.rotation;
        mesh.rotation.x += (rx - mesh.rotation.x) * variantLerp;
        mesh.rotation.y += (ry - mesh.rotation.y) * variantLerp;
        mesh.rotation.z += (rz - mesh.rotation.z) * variantLerp;

        const scaleTarget = target.scale;
        if (Array.isArray(scaleTarget)) {
          const [sx, sy, sz] = scaleTarget;
          mesh.scale.x += (sx - mesh.scale.x) * variantLerp;
          mesh.scale.y += (sy - mesh.scale.y) * variantLerp;
          mesh.scale.z += (sz - mesh.scale.z) * variantLerp;
        } else {
          const uniform = scaleTarget ?? 1;
          mesh.scale.x += (uniform - mesh.scale.x) * variantLerp;
          mesh.scale.y += (uniform - mesh.scale.y) * variantLerp;
          mesh.scale.z += (uniform - mesh.scale.z) * variantLerp;
        }
      });
    }

    const targetPointer =
      state.pointerDriver === "manual" ? manualPointerTarget : devicePointerTarget;

    pointer.lerp(targetPointer, clamp(delta * 7, 0, 1));

    const mobile = isMobile;
    const baseTilt = mobile ? 0.18 : 0.32;
    const parallaxStrength = state.parallax ? baseTilt : 0;
    const breathe = (mobile ? 0.006 : 0.01) * Math.sin(elapsed * 0.85);
    const hoverBoost = state.hovered ? 0.045 : 0;

    const targetPosX = pointer.x * parallaxStrength;
    const targetPosY = pointer.y * parallaxStrength * 0.75;

    shapesGroup.position.x += (targetPosX - shapesGroup.position.x) * clamp(delta * 6, 0, 1);
    shapesGroup.position.y += (targetPosY - shapesGroup.position.y) * clamp(delta * 6, 0, 1);

     const scaleTarget = 1 + breathe + hoverBoost + state.cursorBoost;
    const lerpScale = clamp(delta * 4, 0, 1);
    const currentScale = shapesGroup.scale.x;
    const nextScale = currentScale + (scaleTarget - currentScale) * lerpScale;
    shapesGroup.scale.setScalar(nextScale);
    const maxX = (mobile ? 0.22 : 0.32) * (globalWindow.innerWidth / 2) * 0.01;
    const maxY = (mobile ? 0.18 : 0.26) * (globalWindow.innerHeight / 2) * 0.01;
    shapesGroup.position.x = clamp(shapesGroup.position.x, -maxX, maxX);
    shapesGroup.position.y = clamp(shapesGroup.position.y, -maxY, maxY);

    renderer.render(scene, camera);

    if (!readyDispatched && elapsed > 0.35) {
      readyDispatched = true;
      state = { ...state, ready: true };
      dispatchReady(eventTarget);
      dispatchStateChange(eventTarget, state);
    }

    if (!disposed) {
      animationId = globalWindow.requestAnimationFrame(tick);
    }
  };

  const handleVisibilityChange = () => {
    isVisible = !globalWindow.document.hidden;

    if (!isVisible) {
      if (animationId !== null) {
        globalWindow.cancelAnimationFrame(animationId);
        animationId = null;
      }
      clock.stop();
      return;
    }

    clock.start();
    if (!disposed && animationId === null) {
      animationId = globalWindow.requestAnimationFrame(tick);
    }
  };

  const setState: ThreeAppHandle["setState"] = (updater: StateUpdater) => {
    const snapshot = createStateSnapshot(state);
    const partial =
      typeof updater === "function" ? updater(snapshot) : { ...updater };

    let changed = false;
    let nextState = state;
    let pendingOpacity = state.opacity;
    let opacityChanged = false;
    let pendingShapeOpacity = shapeOpacityState;
    let shapeOpacityChanged = false;

    const commit = (updates: Partial<ThreeAppState>) => {
      nextState = { ...nextState, ...updates };
      changed = true;
    };

    if (partial.variantName && partial.variantName !== state.variantName) {
      const mapped = variantMapping[partial.variantName];
      const responsiveVariant = createResponsiveVariantState(
        mapped,
        globalWindow.innerWidth,
        globalWindow.innerHeight,
      );
      targetVariantState = createVariantState(responsiveVariant);
      commit({
        variantName: partial.variantName,
        variant: createVariantState(responsiveVariant),
      });
    }

    if (partial.palette) {
      commit({ palette: partial.palette });
    }




    if (partial.theme && partial.theme !== state.theme) {
      const nextPalette = partial.palette ?? getDefaultPalette(partial.theme);
      shapes.applyTheme(partial.theme);



      renderer.toneMappingExposure = getToneMappingExposure(partial.theme);
      updateAllMeshOpacities(pendingOpacity, pendingShapeOpacity);
      commit({ theme: partial.theme, palette: nextPalette });
    }

    if (typeof partial.brightness === "number") {
      const nextBrightness = clamp(partial.brightness, 0.5, 2);
      if (nextBrightness !== state.brightness) {
        shapes.setBrightness(nextBrightness);
        commit({ brightness: nextBrightness });
      }
    }

    if (typeof partial.parallax === "boolean" && partial.parallax !== state.parallax) {
      commit({ parallax: partial.parallax });
    }

    if (typeof partial.hovered === "boolean" && partial.hovered !== state.hovered) {



      commit({ hovered: partial.hovered });
    }

    if (typeof partial.cursorBoost === "number") {
      const boost = clamp(partial.cursorBoost, -0.3, 0.45);
      if (boost !== state.cursorBoost) {
        commit({ cursorBoost: boost });
      }
    }

    if (partial.manualPointer) {
      manualPointerTarget.set(partial.manualPointer.x, partial.manualPointer.y);
      commit({ manualPointer: { ...partial.manualPointer } });
      const effectiveDriver = partial.pointerDriver ?? nextState.pointerDriver;
      if (effectiveDriver === "manual") {
        commit({ pointer: { ...partial.manualPointer } });
      }
    }

    if (partial.pointerDriver && partial.pointerDriver !== state.pointerDriver) {
      const source =
        partial.pointerDriver === "manual" ? manualPointerTarget : devicePointerTarget;
      commit({
        pointerDriver: partial.pointerDriver,
        pointer: { x: source.x, y: source.y },
      });
    }

    if (typeof partial.opacity === "number") {
      const nextOpacity = clamp(partial.opacity, 0, 1);
      if (nextOpacity !== pendingOpacity) {
        pendingOpacity = nextOpacity;
        opacityChanged = true;
        commit({ opacity: nextOpacity });
      }
    }

    if (partial.shapeOpacity) {
      const updatedOpacity = { ...pendingShapeOpacity };
      let localChange = false;

      (Object.entries(partial.shapeOpacity) as [ShapeId, number][]).forEach(
        ([key, value]) => {
          if (!(key in updatedOpacity)) {
            return;
          }

          const clampedValue = clamp(value, 0, 1);
          if (updatedOpacity[key] !== clampedValue) {
            updatedOpacity[key] = clampedValue;
            localChange = true;
          }
        },
      );

      if (localChange) {
        pendingShapeOpacity = updatedOpacity;
        shapeOpacityChanged = true;
        commit({ shapeOpacity: { ...pendingShapeOpacity } });
      }
    }

    if (opacityChanged || shapeOpacityChanged) {
      updateAllMeshOpacities(pendingOpacity, pendingShapeOpacity);
    }

    if (partial.variant) {
      targetVariantState = createVariantState(partial.variant);
      commit({ variant: createVariantState(partial.variant) });
    }

    state = nextState;
    shapeOpacityState = pendingShapeOpacity;

    if (changed) {
      dispatchStateChange(eventTarget, state);
    }
  };

  const dispose = () => {
    if (disposed) {
      return;
    }

    disposed = true;

    if (animationId !== null) {
      globalWindow.cancelAnimationFrame(animationId);
      animationId = null;
    }
    mobileQuery.removeEventListener("change", handleMobileChange);
    globalWindow.removeEventListener("resize", resize);
    globalWindow.removeEventListener("pointermove", pointerMove);
    globalWindow.removeEventListener("pointerenter", pointerEnter);
    globalWindow.removeEventListener("pointerleave", pointerLeave);
    globalWindow.removeEventListener("visibilitychange", handleVisibilityChange);
    shapes.dispose();
    // Keep the renderer cleanup quiet for devtools/extensions by avoiding a
    // forced context loss. `renderer.dispose()` is enough to release GPU
    // resources without triggering "Context Lost" warnings.
    renderer.dispose();
    detachFromWindow(handle);
  };

  const handle: ThreeAppHandle = {
    setState,
    dispose,
    bundle: {
      getState: () => createStateSnapshot(state),
      events: eventTarget,
      scene,
      camera,
      renderer,
      variantMapping,
    },
  };

  attachToWindow(handle);

  resize();
  globalWindow.addEventListener("resize", resize);
  globalWindow.addEventListener("pointermove", pointerMove, pointerListenerOptions);
  globalWindow.addEventListener("pointerenter", pointerEnter, pointerListenerOptions);
  globalWindow.addEventListener("pointerleave", pointerLeave, pointerListenerOptions);
  globalWindow.addEventListener("visibilitychange", handleVisibilityChange);

  dispatchStateChange(eventTarget, state);

  if (isVisible) {
    animationId = globalWindow.requestAnimationFrame(tick);
  }

  return handle;
};