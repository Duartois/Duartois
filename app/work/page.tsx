"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { type VariantName } from "../../components/three/types";
import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";

const projectOrder = [
  "sharlee",
  "actResponsable",
  "duaLipa",
  "cocolyze",
  "lesIndecis",
  "gameOfTheGoose",
  "lequipeExplore",
  "silhouette",
  "portraits",
] as const;

type ProjectKey = (typeof projectOrder)[number];

type ProjectPreview = {
  variantName: VariantName;
};

type ProjectCopy = {
  title: string;
  category: string;
  href: string;
  cover: string;
  coverAlt: string;
  coverPlaceholder: string;
};

const projectPreviews: Record<ProjectKey, ProjectPreview> = projectOrder.reduce(
  (previews, key) => {
    previews[key] = { variantName: "work" };
    return previews;
  },
  {} as Record<ProjectKey, ProjectPreview>,
);

export default function WorkPage() {
  const { t } = useTranslation("common");
  const [activeProject, setActiveProject] = useState<ProjectKey>(projectOrder[0]);
  const { isOpen: isMenuOpen } = useMenu();
  const fallStyle = useMenuFallAnimation(2);

  useThreeSceneSetup("work", { resetOnUnmount: true });

  const projectCopy = useMemo(
    () =>
      projectOrder.reduce(
        (copy, key) => {
          copy[key] = t(`work.projects.${key}`, {
            returnObjects: true,
          }) as ProjectCopy;
          return copy;
        },
        {} as Record<ProjectKey, ProjectCopy>,
      ),
    [t],
  );

  const activePreview = projectPreviews[activeProject];
  const activeCopy = projectCopy[activeProject];

  useEffect(() => {
    window.__THREE_APP__?.setState({
      variantName: activePreview.variantName,
      parallax: false,
      hovered: true,
      opacity: isMenuOpen ? 1 : 0.3,
    });
  }, [activePreview, isMenuOpen]);

  return (
    <main className="relative z-10 flex min-h-screen w-full flex-col">
      <section
        className="projects"
        style={{
          pointerEvents: isMenuOpen ? "none" : undefined,
          opacity: isMenuOpen ? 0 : 1,
          transition: "opacity 300ms ease",
        }}
        aria-hidden={isMenuOpen}
      >
        <div className="projects-left" style={fallStyle(0)}>
          <div
            className="projects-left-inside"
            style={{ borderRadius: "0 48px 0 0", opacity: 1 }}
          >
            {projectOrder.map((projectKey) => {
              const copy = projectCopy[projectKey];
              const isActive = projectKey === activeProject;

              return (
                <div
                  key={projectKey}
                  className="projects-image-wrapper"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: "opacity 400ms ease",
                  }}
                >
                  <div
                    className="projects-image-scale"
                    style={{
                      transform: "none",
                      transition: "transform 600ms ease",
                    }}
                  >
                    <img
                      alt={copy.coverAlt}
                      src={copy.cover}
                      className="projects-image"
                      style={{
                        backgroundColor: copy.coverPlaceholder,
                        color: "transparent",
                      }}
                      loading={isActive ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="projects-right" style={fallStyle(1)}>
          <div>
            <div className="page-head">
              <h2 className="page-title">{t("navigation.work")}</h2>
              <h5 className="elements-number">{projectOrder.length}</h5>
            </div>
            <hr className="head-separator" />
          </div>

          <ul>
            {projectOrder.map((projectKey) => {
              const copy = projectCopy[projectKey];
              const isActive = projectKey === activeProject;

              return (
                <li key={projectKey} style={{ opacity: 1 }}>
                  <Link
                    href={copy.href}
                    className="projects-row"
                    onMouseEnter={() => setActiveProject(projectKey)}
                    onFocus={() => setActiveProject(projectKey)}
                  >
                    <div className="projects-row-left">
                      <div className="projects-selected-wrapper">
                        <h4
                          className="projects-selected"
                          style={{
                            transform: isActive
                              ? "translateX(0) translateZ(0)"
                              : "translateX(-100%) translateZ(0)",
                            transition: "transform 300ms ease",
                          }}
                        >
                          →
                        </h4>
                      </div>
                      <h4 className="projects-title" style={{ transform: "none" }}>
                        {copy.title}
                      </h4>
                    </div>
                    <div className="projects-row-right">
                      <p className="projects-category">{copy.category}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
