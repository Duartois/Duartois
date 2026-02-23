import { projectDetails } from "@/app/work/projectDetails";
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
  "/noise.png",
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

const projectDetailImages = Object.values(projectDetails).flatMap((detail) => {
  const contentImages = detail.content.flatMap((block) =>
    block.type === "image" ? [block.src] : [],
  );
  const firstTwoImages = [detail.heroImage.src, ...contentImages].filter(
    Boolean,
  );

  return firstTwoImages.slice(0, 2);
});

// ── Cover images: preload at 828 px (typical viewport max for card thumbnails)
const optimisedCovers = workProjectCovers.map((url) => toPreloadUrl(url, 828));

// ── Background / gallery images: preload at 1200 px
const backgroundAssets = Array.from(
  new Set([
    ...optimisedCovers,
    ...projectDetailImages.map((url) => toPreloadUrl(url, 1200)),
  ]),
);

const workHeroCover = workProjectCovers[0];

export const ESSENTIAL_ASSET_URLS = Object.freeze([
  ...STATIC_ASSETS,
  // Hero cover is the very first thing the user sees — preload at full width.
  ...(workHeroCover ? [toPreloadUrl(workHeroCover, 1920)] : []),
]);

export const BACKGROUND_ASSET_URLS = Object.freeze(backgroundAssets);

// Keep un-optimised list for any callers that need the original URL (e.g. srcset generation).
export const WORK_PROJECT_COVER_URLS = Object.freeze(workProjectCovers);
