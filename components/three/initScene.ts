import { Clock, Scene, Vector2, WebGLRenderer, Color } from "three";

import {
  attachToWindow,
  detachFromWindow,
  dispatchReady,
  dispatchStateChange,
  createStateSnapshot,
} from "./debug-helpers";
import {
  type GradientPalette,
  type StateUpdater,
  type ThreeAppHandle,
  type ThreeAppState,
  type ThemeName,
  type VariantName,
  createVariantState,
  getDefaultPalette,
  variantMapping,
} from "./types";
import {
  MATERIAL_CONFIGS,
  applyPaletteToMaterials,
  cloneVariant,
  createCamera,
  createSceneObjects,
  ensurePalette,
} from "./factories";

export type InitSceneOptions = {
  canvas: HTMLCanvasElement;
  initialVariant?: VariantName;
  theme: ThemeName;
  palette?: GradientPalette;
  parallax?: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const initScene = ({
  canvas,
  initialVariant = "home",
  theme,
  palette,
  parallax = true,
}: InitSceneOptions): ThreeAppHandle => {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(new Color("#000000"), 0);

  const scene = new Scene();
  const camera = createCamera();
  scene.add(camera);

  const effectivePalette = ensurePalette(palette, theme);
  const sceneObjects = createSceneObjects(effectivePalette);
  scene.add(sceneObjects.group);

  const initialState: ThreeAppState = {
    variantName: initialVariant,
    variant: cloneVariant(variantMapping[initialVariant]),
    palette: effectivePalette,
    theme,
    parallax,
    hovered: false,
    cursorBoost: 0,
    pointer: { x: 0, y: 0 },
    pointerDriver: "device",
    manualPointer: { x: 0, y: 0 },
    ready: false,
  };

  const eventTarget = new EventTarget();

  let state = initialState;
  const currentTransforms = createVariantState(state.variant);
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
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
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

    sceneObjects.group.position.x +=
      (targetPosX - sceneObjects.group.position.x) * clamp(delta * 6, 0, 1);
    sceneObjects.group.position.y +=
      (targetPosY - sceneObjects.group.position.y) * clamp(delta * 6, 0, 1);

    const targetRotX = pointer.y * (mobile ? 0.15 : 0.28) + breathe;
    const targetRotY = -pointer.x * (mobile ? 0.22 : 0.35);

    sceneObjects.group.rotation.x +=
      (targetRotX - sceneObjects.group.rotation.x) * clamp(delta * 5, 0, 1);
    sceneObjects.group.rotation.y +=
      (targetRotY - sceneObjects.group.rotation.y) * clamp(delta * 5, 0, 1);

    const scaleTarget = 1 + breathe + hoverBoost + state.cursorBoost;
    const lerpScale = clamp(delta * 4, 0, 1);
    const currentScale = sceneObjects.group.scale.x;
    const nextScale = currentScale + (scaleTarget - currentScale) * lerpScale;
    sceneObjects.group.scale.setScalar(nextScale);

    const maxX = (mobile ? 0.22 : 0.32) * (window.innerWidth / 2) * 0.01;
    const maxY = (mobile ? 0.18 : 0.26) * (window.innerHeight / 2) * 0.01;
    sceneObjects.group.position.x = clamp(
      sceneObjects.group.position.x,
      -maxX,
      maxX,
    );
    sceneObjects.group.position.y = clamp(
      sceneObjects.group.position.y,
      -maxY,
      maxY,
    );

    (Object.keys(currentTransforms) as (keyof typeof currentTransforms)[]).forEach(
      (key, index) => {
        const mesh = sceneObjects.meshes[key];
        const current = currentTransforms[key];
        const target = state.variant[key];
        const lerpAmount = clamp(delta * 4.5, 0, 1);
        current.position = current.position.map((value, axis) =>
          value + (target.position[axis] - value) * lerpAmount,
        ) as typeof current.position;
        current.rotation = current.rotation.map((value, axis) =>
          value + (target.rotation[axis] - value) * lerpAmount,
        ) as typeof current.rotation;
        mesh.position.set(...current.position);
        mesh.rotation.set(...current.rotation);

        const material = sceneObjects.materials[index];
        const config = MATERIAL_CONFIGS[index];
        const time = elapsed + config.timeOffset;
        material.uniforms.uTime.value = time;
        material.uniforms.uAmp.value =
          config.amp * (1 + 0.22 * Math.sin(time * 0.65 + index * 0.2));
        material.uniforms.uFreq.value = config.freq;
      },
    );

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
    }

    if (partial.palette) {
      nextState = { ...nextState, palette: partial.palette };
      applyPaletteToMaterials(sceneObjects.materials, partial.palette);
      changed = true;
    }

    if (partial.theme && partial.theme !== state.theme) {
      const nextPalette = partial.palette ?? getDefaultPalette(partial.theme);
      nextState = {
        ...nextState,
        theme: partial.theme,
        palette: nextPalette,
      };
      applyPaletteToMaterials(sceneObjects.materials, nextPalette);
      changed = true;
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
    sceneObjects.dispose();
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
