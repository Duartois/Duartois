"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import "../../i18n/config";

import { useThreeSceneSetup } from "../../helpers/useThreeSceneSetup";
import { useFluidPageReveal } from "../../helpers/useFluidPageReveal";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";

import {
  projectOrder,
  projectPreviews,
  projectSlugByKey,
  type ProjectSlug,
} from "../projects";
import { getProjectDetailBySlug } from "../projectDetails";

type ProjectPageContentProps = {
  slug: ProjectSlug;
};

type ProjectCopy = {
  title: string;
  category: string;
  href: string;
};

type DetailStyle = CSSProperties & {
  "--accentColor": string;
  "--accentColorDark": string;
};

const IMAGE_BATCH_SIZE = 6;

export function ProjectPageContent({ slug }: ProjectPageContentProps) {
  const detail = getProjectDetailBySlug(slug);
  const { t } = useTranslation("common");
  const { isOpen: isMenuOpen } = useMenu();
  const metadataCount = detail.metadata.length;
  const descriptionCount = detail.description.length;
  const contentCount = detail.content.length;
  const totalFallItems = 5 + metadataCount + descriptionCount + contentCount;
  const fallStyle = useMenuFallAnimation(totalFallItems);
  const pageRevealStyle = useFluidPageReveal(80);
  const pageContentStyle = useMemo(() => {
    const { opacity, ...revealRest } = pageRevealStyle;
    const revealOpacity =
      typeof opacity === "number"
        ? opacity
        : opacity !== undefined
          ? parseFloat(opacity)
          : 1;

    return {
      ...revealRest,
      pointerEvents: isMenuOpen ? "none" : "auto",
      opacity: isMenuOpen ? 0 : revealOpacity,
      transition: "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)",
    } satisfies CSSProperties;
  }, [isMenuOpen, pageRevealStyle]);

  useThreeSceneSetup("work", { resetOnUnmount: true });

  useEffect(() => {
    window.__THREE_APP__?.setState({
      variantName: projectPreviews[detail.key].variantName,
      parallax: false,
      hovered: false,
    });
  }, [detail.key]);

  useEffect(() => {
    const body = document.body;
    const appShell = document.querySelector(".app-shell");

    if (!body) {
      return;
    }

    body.classList.add("body-scrollable");

    if (appShell instanceof HTMLElement) {
      appShell.classList.add("app-shell-scrollable");
    }

    return () => {
      body.classList.remove("body-scrollable");

      if (appShell instanceof HTMLElement) {
        appShell.classList.remove("app-shell-scrollable");
      }
    };
  }, []);

  useEffect(() => {
    window.__THREE_APP__?.setState({ opacity: isMenuOpen ? 1 : 0.3 });
  }, [isMenuOpen]);

  const projectStyle = useMemo<DetailStyle>(
    () => ({
      "--accentColor": detail.accentColor,
      "--accentColorDark": detail.accentColorDark,
    }),
    [detail.accentColor, detail.accentColorDark],
  );

  const currentIndex = projectOrder.indexOf(detail.key);
  const nextKey =
    currentIndex >= 0 && currentIndex + 1 < projectOrder.length
      ? projectOrder[currentIndex + 1]
      : projectOrder[0];
  const nextProjectCopy = t(`work.projects.${nextKey}`, {
    returnObjects: true,
  }) as ProjectCopy;
  const nextProjectSlug = projectSlugByKey[nextKey];
  let fallIndex = 0;
  const nextFall = () => fallStyle(fallIndex++);
  let imageIndex = 0;
  const totalImages = detail.content.filter((block) => block.type === "image").length;
  const [visibleImageCount, setVisibleImageCount] = useState(
    Math.min(IMAGE_BATCH_SIZE, totalImages),
  );
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = useCallback(() => {
    setVisibleImageCount((current) =>
      Math.min(current + IMAGE_BATCH_SIZE, totalImages),
    );
  }, [totalImages]);

  useEffect(() => {
    if (visibleImageCount >= totalImages) {
      return;
    }

    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [handleLoadMore, totalImages, visibleImageCount]);

  return (
    <main className="container work-container">
      <div className="page-content" style={pageContentStyle} aria-hidden={isMenuOpen}>
        <div className="project" style={projectStyle}>
          <div className="header-project">
            <div className="hero-image-wrapper" style={nextFall()}>
              <Image
                alt={detail.heroImage.alt}
                src={detail.heroImage.src}
                className="hero-image"
                fill
                sizes="100vw"
                priority
                fetchPriority="high"
                placeholder="empty"
              />
            </div>
          </div>

          <div className="project-title">
            <div>
              <div className="page-head" style={nextFall()}>
                <h2 className="page-title">{detail.title}</h2>
              </div>
              <hr className="head-separator" style={nextFall()} />
            </div>
          </div>

          <div className="project-intro">
            <div className="project-data">
              <table>
                <tbody>
                  {detail.metadata.map((entry, index) => (
                    <tr key={`${entry.label}-${index}`} style={nextFall()}>
                      <td>
                        <h6>{t(`projectPage.metadata.${entry.label}`)}</h6>
                      </td>
                      <td>
                        {entry.values.length > 1 ? (
                          <ul>
                            {entry.values.map((value) => (
                              <li key={value}>{value}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{entry.values[0]}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="project-description">
              {detail.description.map((paragraph, index) => (
                <p key={`${detail.slug}-description-${index}`} style={nextFall()}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="project-content">
            {detail.content.map((block, index) => {
              const blockStyle = nextFall();

              if (block.type === "heading") {
                return (
                  <h6 key={`heading-${index}`} style={blockStyle}>
                    {block.text}
                  </h6>
                );
              }

              if (block.type === "paragraph") {
                return (
                  <p key={`paragraph-${index}`} style={blockStyle}>
                    {block.text}
                  </p>
                );
              }

              if (block.type === "image") {
                const currentImageIndex = imageIndex;
                imageIndex += 1;
                const isVisible = currentImageIndex < visibleImageCount;
                const isHighPriority = currentImageIndex < 2;

                return (
                  <div
                    className="project-content-wrapper"
                    key={`image-${index}`}
                    style={blockStyle}
                  >
                    {isVisible ? (
                      <Image
                        alt={block.alt}
                        src={block.src}
                        className="project-content-image"
                        width={1600}
                        height={900}
                        sizes="(max-width: 61.99em) 100vw, 70vw"
                        loading={isHighPriority ? "eager" : "lazy"}
                        fetchPriority={isHighPriority ? "high" : "auto"}
                        priority={isHighPriority}
                        placeholder="empty"
                        style={{ width: "100%", height: "auto" }}
                      />
                    ) : (
                      <div
                        className="project-content-image"
                        aria-hidden="true"
                        style={{ width: "100%", height: "auto", aspectRatio: "16 / 9" }}
                      />
                    )}
                  </div>
                );
              }

              return null;
            })}
            {visibleImageCount < totalImages && (
              <div ref={loadMoreRef} aria-hidden="true" />
            )}
          </div>

          <div className="next-project">
            <hr style={nextFall()} />
            <Link href={`/work/${nextProjectSlug}`}>
              <div className="next-project-wrapper" style={nextFall()}>
                <div className="next-project-left">
                  <div className="next-project-selected-wrapper">
                    <h4 className="next-project-selected">→</h4>
                  </div>
                  <h4 className="next-project-title">
                    {t("projectPage.nextProject")}
                  </h4>
                </div>
                <div className="next-project-right">
                  <h4>{nextProjectCopy.title}</h4>
                  <p>{nextProjectCopy.category}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
