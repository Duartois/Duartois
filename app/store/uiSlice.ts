import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SmoothScrollEngine = "lenis" | "locomotive";

export interface UiState {
  smoothScrollEngine: SmoothScrollEngine;
  pwaInstallPromptSeen: boolean;
}

const initialState: UiState = {
  smoothScrollEngine: "lenis",
  pwaInstallPromptSeen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSmoothScrollEngine(state, action: PayloadAction<SmoothScrollEngine>) {
      state.smoothScrollEngine = action.payload;
    },
    setPwaInstallPromptSeen(state, action: PayloadAction<boolean>) {
      state.pwaInstallPromptSeen = action.payload;
    },
  },
});

export const { setSmoothScrollEngine, setPwaInstallPromptSeen } =
  uiSlice.actions;
export default uiSlice.reducer;
