import { projectDetails } from "@/app/work/projectDetails";
import enCommon from "@/public/locales/en/common.json";
import ptCommon from "@/public/locales/pt/common.json";

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

const backgroundAssets = Array.from(
  new Set([...workProjectCovers, ...projectDetailImages]),
);
const workHeroCover = workProjectCovers[0];

export const ESSENTIAL_ASSET_URLS = Object.freeze([
  ...STATIC_ASSETS,
  ...(workHeroCover ? [workHeroCover] : []),
]);
export const BACKGROUND_ASSET_URLS = Object.freeze(backgroundAssets);
