const STATIC_ASSETS = [
  "/about-01.avif",
  "/about-portrait.svg",
  "/miniplayer-border.svg",
  "/noise.png",
  "/wave-light.svg",
  "/wave.svg",
] as const;

export const CRITICAL_ASSET_URLS = Object.freeze([...STATIC_ASSETS]);
