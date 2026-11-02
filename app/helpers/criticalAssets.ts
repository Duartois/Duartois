import enCommon from "@/public/locales/en/common.json";
import ptCommon from "@/public/locales/pt/common.json";
import { getOptimizedGraphAssetsUrl } from "@/app/helpers/imageUtils";

type WorkProjectCopy = {
  cover?: string;
};

const STATIC_ASSETS = [
  "/about-01.avif",
  "/about-portrait.svg",
  "/miniplayer-border.svg",
  "/wave-light.svg",
  "/wave.svg",
] as const;

/**
 * Converts a URL to an optimised WebP variant when it's a Hygraph CDN asset.
 * Static public/ assets are returned as-is (they're already small/optimal).
 */
function toPreloadUrl(url: string, width = 1200): string {
  return getOptimizedGraphAssetsUrl(url, {
    width,
    quality: 80,
    format: "webp",
  });
}

const workProjectCovers = [
  ...Object.values(enCommon.work?.projects ?? {}),
  ...Object.values(ptCommon.work?.projects ?? {}),
]
  .map((project) => (project as WorkProjectCopy).cover)
  .filter(Boolean) as string[];

// ── Cover images: warmed at 828 px, the size the Work list actually asks for on
// typical desktop viewports. Only the resized WebP is fetched — never the
// original upload — and only when the Work cover column is visible.
const optimisedCovers = workProjectCovers.map((url) => toPreloadUrl(url, 828));

export const ESSENTIAL_ASSET_URLS = Object.freeze([...STATIC_ASSETS]);

export const BACKGROUND_ASSET_URLS = Object.freeze(
  Array.from(new Set(optimisedCovers)),
);
