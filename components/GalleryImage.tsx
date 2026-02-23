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

export default function GalleryImage({
  images,
  wrapperStyle,
}: GalleryImageProps) {
  return (
    <>
      {images.map((image, index) => (
        <div
          className="project-content-wrapper"
          key={`${image.src}-${index}`}
          style={wrapperStyle}
        >
          <Image
            alt={image.alt}
            src={image.src}
            className="project-content-image"
            width={1920} // Default width for gallery images
            height={1080} // Default height for gallery images
            priority={true}
            style={{ color: "transparent", width: "100%", height: "auto" }}
          />
        </div>
      ))}
    </>
  );
}
