"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";
import { useFluidPageReveal } from "../helpers/useFluidPageReveal";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";

import {
  projectOrder,
  type ProjectKey,
  projectPreviews,
} from "./projects";

type ProjectCopy = {
  title: string;
  category: string;
  href: string;
  cover: string;
  coverAlt: string;
  coverPlaceholder: string;
};

export default function WorkPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [activeProject, setActiveProject] = useState<ProjectKey>(projectOrder[0]);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const { isOpen: isMenuOpen } = useMenu();
  const totalFallItems = 3 + projectOrder.length;
  const fallStyle = useMenuFallAnimation(totalFallItems, { variant: "work" });
  const pageRevealStyle = useFluidPageReveal(80);
  const navigationTimeoutRef = useRef<number>();

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

  let fallIndex = 0;
  const nextFall = () => fallStyle(fallIndex++);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        window.clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleProjectClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      event.preventDefault();

      if (isNavigatingAway) {
        return;
      }

      setIsNavigatingAway(true);
      window.dispatchEvent(new CustomEvent("app-navigation:start"));

      navigationTimeoutRef.current = window.setTimeout(() => {
        router.push(href);
      }, 680);
    },
    [isNavigatingAway, router],
  );

  const projectsStyle = useMemo(() => {
    const { opacity, ...revealRest } = pageRevealStyle;
    const revealOpacity =
      typeof opacity === "number"
        ? opacity
        : opacity !== undefined
          ? parseFloat(opacity)
          : 1;

    return {
      ...revealRest,
      pointerEvents: isMenuOpen || isNavigatingAway ? "none" : undefined,
      opacity: isMenuOpen || isNavigatingAway ? 0 : revealOpacity,
    } satisfies CSSProperties;
  }, [isMenuOpen, isNavigatingAway, pageRevealStyle]);

  return (
    <main className="work-page relative z-10 flex min-h-screen w-full flex-col">
      <section
        className="projects"
        style={projectsStyle}
        aria-hidden={isMenuOpen}
      >
        <div className="projects-left" style={nextFall()}>
          <div className="projects-left-inside">
            {projectOrder.map((projectKey) => {
              const copy = projectCopy[projectKey];
              const isActive = projectKey === activeProject;

              return (
                <div
                  key={projectKey}
                  className={`projects-image-wrapper${isActive ? " is-active" : ""}`}
                >
                    <div
                      className="projects-image-scale"
                      style={{
                        backgroundColor: copy.coverPlaceholder,
                      }}
                    >
                      <Image
                        alt={copy.coverAlt}
                        src={copy.cover}
                        className="projects-image"
                        fill
                        sizes="(max-width: 61.99em) 100vw, 50vw"
                        placeholder="empty"
                        priority={isActive}
                        loading={isActive ? "eager" : "lazy"}
                        fetchPriority={isActive ? "high" : "auto"}
                        style={{ color: "transparent" }}
                      />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="projects-right">
          <div>
            <div className="page-head" style={nextFall()}>
              <h2 className="page-title">{t("navigation.work")}</h2>
              <h5 className="elements-number">{projectOrder.length}</h5>
            </div>
            <hr className="head-separator" style={nextFall()} />
          </div>

          <ul>
            {projectOrder.map((projectKey) => {
              const copy = projectCopy[projectKey];
              const isActive = projectKey === activeProject;
              const itemStyle = nextFall();

              return (
                <li key={projectKey} style={itemStyle}>
                  <Link
                    href={copy.href}
                    className="projects-row"
                    prefetch={false}
                    onMouseEnter={() => setActiveProject(projectKey)}
                    onFocus={() => setActiveProject(projectKey)}
                    onClick={(event) => handleProjectClick(event, copy.href)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="projects-row-left">
                      <div className="projects-selected-wrapper">
                        <h4
                          className="projects-selected"
                        >
                          →
                        </h4>
                      </div>
                      <h4
                        className="projects-title"
                      >
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
