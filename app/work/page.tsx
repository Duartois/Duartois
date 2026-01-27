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
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";
import {
  APP_NAVIGATION_START_EVENT,
  dispatchAppEvent,
} from "@/app/helpers/appEvents";

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
  const [previousProject, setPreviousProject] = useState<ProjectKey | null>(null);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const { isOpen: isMenuOpen } = useMenu();
  const totalFallItems = 3 + projectOrder.length;
  const fallStyle = useMenuFallAnimation(totalFallItems, { variant: "work" });
  const navigationTimeoutRef = useRef<number>();
  const previousProjectTimeoutRef = useRef<number>();

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
      if (previousProjectTimeoutRef.current) {
        window.clearTimeout(previousProjectTimeoutRef.current);
      }
    };
  }, []);

  const handleProjectActivate = useCallback(
    (projectKey: ProjectKey) => {
      if (projectKey === activeProject) {
        return;
      }

      if (previousProjectTimeoutRef.current) {
        window.clearTimeout(previousProjectTimeoutRef.current);
      }

      setPreviousProject(activeProject);
      setActiveProject(projectKey);

      previousProjectTimeoutRef.current = window.setTimeout(() => {
        setPreviousProject(null);
      }, 1000);
    },
    [activeProject],
  );

  const handleProjectHover = useCallback(
    (projectKey: ProjectKey, href: string) => {
      handleProjectActivate(projectKey);
      router.prefetch(href);
    },
    [handleProjectActivate, router],
  );

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
      dispatchAppEvent(APP_NAVIGATION_START_EVENT);

      navigationTimeoutRef.current = window.setTimeout(() => {
        router.push(href);
      }, 680);
    },
    [isNavigatingAway, router],
  );

  const projectsStyle = useMemo(() => {
    return {
      pointerEvents: isMenuOpen || isNavigatingAway ? "none" : undefined,
      opacity: isMenuOpen || isNavigatingAway ? 0 : 1,
      transition: "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)",
    } satisfies CSSProperties;
  }, [isMenuOpen, isNavigatingAway]);

  return (
    <main className="work-page relative z-10 flex min-h-screen w-full flex-col">
      <section
        className="projects"
        style={projectsStyle}
        aria-hidden={isMenuOpen}
      >
        <div className="projects-left" style={nextFall()}>
          <div className="projects-left-inside">
            {[previousProject, activeProject]
              .filter((projectKey): projectKey is ProjectKey => Boolean(projectKey))
              .map((projectKey) => {
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
                        priority={isActive}
                        loading={isActive ? "eager" : "lazy"}
                        fetchPriority={isActive ? "high" : "auto"}
                        quality={80}
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
                    onMouseEnter={() => handleProjectHover(projectKey, copy.href)}
                    onFocus={() => handleProjectHover(projectKey, copy.href)}
                    onClick={(event) => handleProjectClick(event, copy.href)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="projects-row-left">
                      <div className="projects-selected-wrapper">
                        <h4 className="projects-selected">→</h4>
                      </div>
                      <h4 className="projects-title">{copy.title}</h4>
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
