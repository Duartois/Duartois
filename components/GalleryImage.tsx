import type { CSSProperties } from "react";
import Image from "next/image";
import { IMAGE_SIZES } from "../app/helpers/imageUtils";

export type GalleryImageItem = {
  src: string;
  alt: string;
  /**
   * Optional dominant color for the placeholder background.
   * Falls back to the neutral site background color.
   */
  placeholderColor?: string;
};

/**
 * GalleryImage renders a responsive image gallery with:
 * - Aspect ratio preservation to prevent layout shift
 * - Color placeholder while loading
 * - Optimized srcset generation via Next.js Image
 * - Lazy loading for off-screen images
 */

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
              backgroundColor: image.placeholderColor || "var(--background-color)",
            }}
          >
            <Image
              alt={image.alt}
              src={image.src}
              className="project-content-image"
              fill
              sizes={IMAGE_SIZES.gallery}
              loading="lazy"
              style={{ objectFit: "cover", color: "transparent" }}
            />
          </div>
        </div>
      ))}
    </>
  );
}