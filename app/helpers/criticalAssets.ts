const STATIC_ASSETS = [
  "/wave.svg",
] as const;

export const CRITICAL_ASSET_URLS = Object.freeze([...STATIC_ASSETS]);
