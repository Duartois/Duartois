import {
  projectDetails,
  type ProjectContentBlock,
} from "@/app/work/projectDetails";

const STATIC_ASSETS = [
  "/about-01.avif",
  "/about-portrait.svg",
  "/miniplayer-border.svg",
  "/noise.png",
  "/wave-light.svg",
  "/wave.svg",
] as const;

type ImageBlock = Extract<ProjectContentBlock, { type: "image" }>;

const projectMedia = Object.values(projectDetails).flatMap((detail) => {
  const images = detail.content.filter((block): block is ImageBlock => block.type === "image");
  const imageSources = images.map((block) => block.src);
  return [detail.heroImage.src, ...imageSources];
});

const uniqueAssets = Array.from(new Set<string>([...STATIC_ASSETS, ...projectMedia]));

export const CRITICAL_ASSET_URLS = Object.freeze(uniqueAssets);
