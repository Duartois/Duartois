import { createVariantState, type ThreeAppHandle, type ThreeAppState } from "./types";

export const createStateSnapshot = (state: ThreeAppState) =>
  Object.freeze({
    ...state,
    variant: createVariantState(state.variant),
    palette: state.palette.map((stops) => [...stops]) as ThreeAppState["palette"],
    pointer: { ...state.pointer },
  });

export const attachToWindow = (handle: ThreeAppHandle) => {
  if (typeof window === "undefined") return;
  window.__THREE_APP__ = handle;
};

export const detachFromWindow = (handle: ThreeAppHandle) => {
  if (typeof window === "undefined") return;
  if (window.__THREE_APP__ === handle) {
    delete window.__THREE_APP__;
  }
};

export const dispatchStateChange = (
  target: EventTarget,
  state: Readonly<ThreeAppState>,
) => {
  target.dispatchEvent(
    new CustomEvent("statechange", {
      detail: { state: createStateSnapshot(state) },
    }),
  );
};

export const dispatchReady = (target: EventTarget) => {
  target.dispatchEvent(new CustomEvent("ready"));
};
