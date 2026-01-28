"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import "../../i18n/config";

import { useThreeSceneSetup } from "../../helpers/useThreeSceneSetup";
import { useNavigationExitDuration } from "../../helpers/useNavigationExitDuration";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";
import { useThreeApp } from "@/app/helpers/threeAppContext";

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

export function ProjectPageContent({ slug }: ProjectPageContentProps) {
  const detail = getProjectDetailBySlug(slug);
  const { t } = useTranslation("common");
  const { isOpen: isMenuOpen } = useMenu();
  const metadataCount = detail.metadata.length;
  const descriptionCount = detail.description.length;
  const contentCount = detail.content.length;
  const totalFallItems = 5 + metadataCount + descriptionCount + contentCount;
  const fallStyle = useMenuFallAnimation(totalFallItems);
  const { app } = useThreeApp();
  useNavigationExitDuration(totalFallItems, { variant: "work" });
  const pageContentStyle = useMemo(
    () =>
      ({
        pointerEvents: isMenuOpen ? "none" : "auto",
        opacity: isMenuOpen ? 0 : 1,
        transition: "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)",
      }) satisfies CSSProperties,
    [isMenuOpen],
  );

  useThreeSceneSetup("work");

  useEffect(() => {
    app?.setState({
      variantName: projectPreviews[detail.key].variantName,
      parallax: false,
      hovered: false,
    });
  }, [app, detail.key]);

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
    app?.setState({ opacity: isMenuOpen ? 1 : 0.3 });
  }, [app, isMenuOpen]);

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
  const eagerImageCount = 2;
  let imageIndex = 0;
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
                quality={85}
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
                const isHighPriority = currentImageIndex < eagerImageCount;

                return (
                  <div
                    className="project-content-wrapper"
                    key={`image-${index}`}
                    style={blockStyle}
                  >
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
                      quality={85}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                );
              }

              return null;
            })}
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
