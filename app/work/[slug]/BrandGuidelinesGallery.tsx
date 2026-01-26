"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export type BrandGuidelinesImage = {
  src: string;
  alt: string;
};

type BrandGuidelinesGalleryProps = {
  images: BrandGuidelinesImage[];
  initialCount?: number;
  batchSize?: number;
  loadMoreLabel: string;
};

export default function BrandGuidelinesGallery({
  images,
  initialCount = 6,
  batchSize = 6,
  loadMoreLabel,
}: BrandGuidelinesGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const loadMoreRef = useRef<HTMLButtonElement | null>(null);

  const visibleImages = useMemo(
    () => images.slice(0, visibleCount),
    [images, visibleCount],
  );
  const hasMore = visibleCount < images.length;

  useEffect(() => {
    if (typeof window === "undefined" || !hasMore) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + batchSize, images.length),
          );
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [batchSize, hasMore, images.length]);

  return (
    <div className="project-guidelines-gallery">
      {visibleImages.map((image, index) => (
        <div className="project-content-wrapper" key={`${image.src}-${index}`}>
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
            placeholder="empty"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      ))}
      {hasMore ? (
        <button
          ref={loadMoreRef}
          type="button"
          className="guidelines-load-more"
          onClick={() =>
            setVisibleCount((count) =>
              Math.min(count + batchSize, images.length),
            )
          }
        >
          {loadMoreLabel}
        </button>
      ) : null}
    </div>
  );
}
