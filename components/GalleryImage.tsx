import type { CSSProperties } from "react";
import Image from "next/image";

export type GalleryImageItem = {
  src: string;
  alt: string;
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
          <Image
            alt={image.alt}
            src={image.src}
            className="project-content-image"
            width={1600}
            height={900}
            sizes="(max-width: 61.99em) 100vw, 70vw"
            loading="lazy"
            fetchPriority="auto"
            quality={85}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      ))}
    </>
  );
}
