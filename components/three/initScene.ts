import { Clock, Color, Scene, Vector2, WebGLRenderer } from "three";
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
  type StateUpdater,
  type ThreeAppHandle,
  type ThreeAppState,
  type ThemeName,
  type VariantName,
  getDefaultPalette,
  variantMapping,
} from "./types";
import {
  cloneVariant,
  createCamera,
  ensurePalette,
} from "./factories";
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

export const initScene = async ({
  canvas,
  initialVariant = "home",
  theme,
  palette,
  parallax = true,
}: InitSceneOptions): Promise<ThreeAppHandle> => {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
 
  renderer.setClearColor(new Color("#000000"), 0);
  // === pastel/filmic renderer ===
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // menos brilho no tema claro, levemente mais no escuro
  renderer.toneMappingExposure = theme === "light" ? 1.1 : 1.5;
  // sombras desligadas para evitar contorno duro
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new Scene();
  const camera = createCamera();
  scene.add(camera);

  const effectivePalette = ensurePalette(palette, theme);
  const baseVariant = cloneVariant(variantMapping[initialVariant]);
  const shapes = await addDuartoisSignatureShapes(scene, baseVariant, theme);
  shapes.setBrightness(DEFAULT_BRIGHTNESS);
  const shapeMeshes = Object.values(shapes.meshes);
  const shapesGroup = shapes.group;
  type MaterialWithOpacity = THREE.Material & {
    opacity: number;
    transparent: boolean;
  };

  const hasOpacity = (material: THREE.Material): material is MaterialWithOpacity =>
    "opacity" in material && "transparent" in material;

  const updateMeshesOpacity = (opacity: number) => {
    shapeMeshes.forEach((mesh) => {
      const material = mesh.material;
      const updateMaterial = (mat: THREE.Material) => {
        if (hasOpacity(mat)) {
          mat.opacity = opacity;
          mat.transparent = opacity < 1 ? true : mat.transparent;
          mat.needsUpdate = true;
        }
      };

      if (Array.isArray(material)) {
        material.forEach(updateMaterial);
      } else {
        updateMaterial(material);
      }
    });
  };
  const initialState: ThreeAppState = {
    variantName: initialVariant,
    variant: cloneVariant(baseVariant),
    palette: effectivePalette,
    theme,
    parallax,
    hovered: false,
    cursorBoost: 0,
    pointer: { x: 0, y: 0 },
    pointerDriver: "device",
    manualPointer: { x: 0, y: 0 },
    opacity: 1,
    brightness: DEFAULT_BRIGHTNESS,
    ready: false,
  };

  updateMeshesOpacity(initialState.opacity);

  const eventTarget = new EventTarget();

  let state = initialState;
  const pointer = new Vector2();
  const devicePointerTarget = new Vector2();
  const manualPointerTarget = new Vector2();

  devicePointerTarget.set(initialState.pointer.x, initialState.pointer.y);
  manualPointerTarget.set(
    initialState.manualPointer.x,
    initialState.manualPointer.y,
  );

  const clock = new Clock();
  let readyDispatched = false;
  let animationId: number | null = null;

  const isMobile = () =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 768px)").matches
      : false;

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
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
  };


  const pointerMove = (event: PointerEvent) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
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
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    const targetPointer =
      state.pointerDriver === "manual" ? manualPointerTarget : devicePointerTarget;

    pointer.lerp(targetPointer, clamp(delta * 7, 0, 1));

    const mobile = isMobile();
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

    const maxX = (mobile ? 0.22 : 0.32) * (window.innerWidth / 2) * 0.01;
    const maxY = (mobile ? 0.18 : 0.26) * (window.innerHeight / 2) * 0.01;
    shapesGroup.position.x = clamp(shapesGroup.position.x, -maxX, maxX);
    shapesGroup.position.y = clamp(shapesGroup.position.y, -maxY, maxY);

    renderer.render(scene, camera);

    if (!readyDispatched && elapsed > 0.35) {
      readyDispatched = true;
      state = { ...state, ready: true };
      dispatchReady(eventTarget);
      dispatchStateChange(eventTarget, state);
    }

    animationId = window.requestAnimationFrame(tick);
  };

  const setState: ThreeAppHandle["setState"] = (updater: StateUpdater) => {
    const snapshot = createStateSnapshot(state);
    const partial =
      typeof updater === "function" ? updater(snapshot) : { ...updater };

    let changed = false;
    let nextState = state;

    if (partial.variantName && partial.variantName !== state.variantName) {
      const mapped = variantMapping[partial.variantName];
      nextState = {
        ...nextState,
        variantName: partial.variantName,
        variant: cloneVariant(mapped),
      };
      changed = true;
      shapes.applyVariant(nextState.variant);
    }

    if (partial.palette) {
      nextState = { ...nextState, palette: partial.palette };
      changed = true;
    }

    if (partial.theme && partial.theme !== state.theme) {
      const nextPalette = partial.palette ?? getDefaultPalette(partial.theme);
      shapes.applyTheme(partial.theme);
      renderer.toneMappingExposure =
        partial.theme === "light" ? 1.1 : 1.5;
      nextState = {
        ...nextState,
        theme: partial.theme,
        palette: nextPalette,
      };
      changed = true;
    }

    if (typeof partial.brightness === "number") {
      const nextBrightness = clamp(partial.brightness, 0.5, 2);
      if (nextBrightness !== state.brightness) {
        shapes.setBrightness(nextBrightness);
        nextState = { ...nextState, brightness: nextBrightness };
        changed = true;
      }
    }

    if (typeof partial.parallax === "boolean" && partial.parallax !== state.parallax) {
      nextState = { ...nextState, parallax: partial.parallax };
      changed = true;
    }

    if (typeof partial.hovered === "boolean" && partial.hovered !== state.hovered) {
      nextState = { ...nextState, hovered: partial.hovered };
      changed = true;
    }

    if (typeof partial.cursorBoost === "number") {
      const boost = clamp(partial.cursorBoost, -0.3, 0.45);
      if (boost !== state.cursorBoost) {
        nextState = { ...nextState, cursorBoost: boost };
        changed = true;
      }
    }

    if (partial.manualPointer) {
      manualPointerTarget.set(partial.manualPointer.x, partial.manualPointer.y);
      nextState = {
        ...nextState,
        manualPointer: { ...partial.manualPointer },
      };
      const effectiveDriver = partial.pointerDriver ?? nextState.pointerDriver;
      if (effectiveDriver === "manual") {
        nextState = {
          ...nextState,
          pointer: { ...partial.manualPointer },
        };
      }
      changed = true;
    }

    if (partial.pointerDriver && partial.pointerDriver !== state.pointerDriver) {
      nextState = { ...nextState, pointerDriver: partial.pointerDriver };
      const source =
        partial.pointerDriver === "manual" ? manualPointerTarget : devicePointerTarget;
      nextState = {
        ...nextState,
        pointer: { x: source.x, y: source.y },
      };
      changed = true;
    }

    if (typeof partial.opacity === "number") {
      const nextOpacity = clamp(partial.opacity, 0, 1);
      if (nextOpacity !== state.opacity) {
        nextState = { ...nextState, opacity: nextOpacity };
        updateMeshesOpacity(nextOpacity);
        changed = true;
      }
    }

    if (partial.variant) {
      nextState = { ...nextState, variant: cloneVariant(partial.variant) };
      shapes.applyVariant(nextState.variant);
      changed = true;
    }

    state = nextState;

    if (changed) {
      dispatchStateChange(eventTarget, state);
    }
  };

  const dispose = () => {
    if (animationId !== null) {
      window.cancelAnimationFrame(animationId);
      animationId = null;
    }
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", pointerMove);
    window.removeEventListener("pointerenter", pointerEnter);
    window.removeEventListener("pointerleave", pointerLeave);
    shapes.dispose();
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
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerenter", pointerEnter);
  window.addEventListener("pointerleave", pointerLeave);

  dispatchStateChange(eventTarget, state);

  animationId = window.requestAnimationFrame(tick);

  return handle;
};
