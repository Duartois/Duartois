"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import "../../i18n/config";

import { useThreeSceneSetup } from "../../helpers/useThreeSceneSetup";

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

  useThreeSceneSetup("work", { resetOnUnmount: true });

  useEffect(() => {
    window.__THREE_APP__?.setState({
      variantName: projectPreviews[detail.key].variantName,
      parallax: false,
      hovered: false,
      opacity: 0.3,
    });
  }, [detail.key]);

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

  return (
    <main className="container">
      <div data-scroll-container="true" id="scroll-container">
        <div
          data-scroll-section="true"
          data-scroll-section-id="section0"
          data-scroll-section-inview=""
        >
          <div className="page-content" style={{ pointerEvents: "auto" }}>
            <div className="project" style={projectStyle}>
              <div className="header-project">
                <div className="hero-image-wrapper">
                  <img
                    alt={detail.heroImage.alt}
                    src={detail.heroImage.src}
                    className="hero-image"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="project-title">
                <div>
                  <div className="page-head">
                    <h2 className="page-title">{detail.title}</h2>
                  </div>
                  <hr className="head-separator" />
                </div>
              </div>

              <div className="project-intro">
                <div className="project-data">
                  <table>
                    <tbody>
                      {detail.metadata.map((entry, index) => (
                        <tr key={`${entry.label}-${index}`}>
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
                    <p key={`${detail.slug}-description-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="project-content">
                {detail.content.map((block, index) => {
                  if (block.type === "heading") {
                    return <h6 key={`heading-${index}`}>{block.text}</h6>;
                  }

                  if (block.type === "paragraph") {
                    return <p key={`paragraph-${index}`}>{block.text}</p>;
                  }

                  return (
                    <div className="project-content-wrapper" key={`image-${index}`}>
                      <img
                        alt={block.alt}
                        src={block.src}
                        className="project-content-image"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="next-project">
                <hr />
                <Link href={`/work/${nextProjectSlug}`}>
                  <div className="next-project-wrapper">
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
        </div>
      </div>
    </main>
  );
}
