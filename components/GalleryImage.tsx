import type { CSSProperties } from "react";
import Image from "next/image";
import {
  DEFAULT_BLUR_DATA_URL,
  IMAGE_SIZES,
} from "../app/helpers/imageUtils";

export type GalleryImageItem = {
  src: string;
  alt: string;
  /**
   * Optional dominant color of the image used to generate a matching
   * blur placeholder. Falls back to the neutral site background color.
   */
  placeholderColor?: string;
};

type GalleryImageProps = {
  images: GalleryImageItem[];
  wrapperStyle?: CSSProperties;
};

export default function GalleryImage({ images, wrapperStyle }: GalleryImageProps) {
  return (
    <>
      {images.map((image, index) => (
        <div
          className="project-content-wrapper"
          key={`${image.src}-${index}`}
          style={wrapperStyle}
        >
          {/*
           * Use a positioned wrapper so `fill` works correctly.
           * The aspect-ratio keeps the container from collapsing
           * before the image loads (avoids layout shift).
           * 16/9 matches the CDN images; adjust if needed.
           */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
            }}
          >
            <Image
              alt={image.alt}
              src={image.src}
              className="project-content-image"
              fill
              sizes={IMAGE_SIZES.gallery}
              loading="lazy"
              fetchPriority="auto"
              quality={90}
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR_DATA_URL}
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      ))}
    </>
  );
}