"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation, Trans } from "react-i18next";
import "./i18n/config";
import { useThreeSceneSetup } from "./helpers/useThreeSceneSetup";
import { useNavigationExitDuration } from "./helpers/useNavigationExitDuration";
import { navigateWithExit, EXIT_NAVIGATION_ATTRIBUTE } from "./helpers/navigateWithExit";
import {
  useEffect,
  PropsWithChildren,
  useCallback,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { getFallItemStyle } from "@/components/fallAnimation";
import {
  WORK_ITEM_STAGGER_DELAY,
  WORK_ITEM_TRANSITION_DURATION,
} from "@/components/animation/fallConstants";
import {
  APP_MENU_CLOSE_EVENT,
  APP_MENU_OPEN_EVENT,
  APP_NAVIGATION_START_EVENT,
  APP_SHELL_REVEAL_EVENT,
} from "@/app/helpers/appEvents";

import {
  HERO_LINE_ONE_MONOGRAM,
  HERO_LINE_TWO_MONOGRAM,
  createVariantState,
  createResponsiveHeroVariantState,
  createResponsiveVariantState,
  variantMapping,
  type VariantState,
} from "@/components/three/types";


type NameWithWaveProps = PropsWithChildren<{ hoverVariant: VariantState }>;

// componente para estilizar o <name> vindo do JSON
function NameWithWave({ children, hoverVariant }: NameWithWaveProps) {
  const storedVariantRef = useRef<VariantState | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  const applyHoverVariant = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const app = window.__THREE_APP__;
    if (!app) {
      return;
    }

    const responsiveHover = createResponsiveHeroVariantState(
      hoverVariant,
      window.innerWidth,
      window.innerHeight,
    );

    app.setState((previous) => {
      if (!storedVariantRef.current) {
        storedVariantRef.current = createVariantState(previous.variant);
      }
      return {
        hovered: true,
        variant: responsiveHover,
      };
    });
  }, [hoverVariant]);

  const restoreVariant = useCallback(() => {
    if (typeof window === "undefined") {
      storedVariantRef.current = null;
      return;
    }

    const app = window.__THREE_APP__;
    if (!app) {
      storedVariantRef.current = null;
      return;
    }

    app.setState((previous) => {
      const fallback =
        storedVariantRef.current ??
        createResponsiveVariantState(
          variantMapping[previous.variantName],
          window.innerWidth,
          window.innerHeight,
        );

      storedVariantRef.current = null;

      return {
        hovered: false,
        variant: fallback,
      };
    });
  }, []);

  const handlePointerEnter = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.innerWidth <= 990) {
      return;
    }

    applyHoverVariant();
  }, [applyHoverVariant]);

  const handlePointerLeave = useCallback(
    (_event: ReactPointerEvent<HTMLSpanElement>) => {
      restoreVariant();
    },
    [restoreVariant],
  );

  const handleClick = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.innerWidth > 990) {
      return;
    }

    if (storedVariantRef.current) {
      restoreVariant();
      return;
    }

    applyHoverVariant();
  }, [applyHoverVariant, restoreVariant]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!storedVariantRef.current || !spanRef.current) {
        return;
      }

      const target = event.target as Node | null;
      if (!target || spanRef.current.contains(target)) {
        return;
      }

      restoreVariant();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [restoreVariant]);

  return (
    <span
      ref={spanRef}
      className="name"
      data-cursor-interactive
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      {children}
      <div className="wave-wrapper">
        <div className="wave" />
      </div>
    </span>
  );
}

export default function HomePage() {
  // mantém sua rotina do underline/wave
  function applyBackgroundPositionFromClass(el: HTMLElement) {
    const cls = el.className || "";
    const rxX = /background-position-x:\s*([+-]?\d*\.?\d+)px/;
    const rxY = /background-position-y:\s*([+-]?\d*\.?\d+)px/;

    const mx = cls.match(rxX);
    if (mx) {
      const x = `${parseFloat(mx[1])}px`;
      el.style.backgroundPositionX = x;
      el.style.setProperty("--wave-x", x);
    }

    const my = cls.match(rxY);
    if (my) {
      const y = `${parseFloat(my[1])}px`;
      el.style.backgroundPositionY = y;
      el.style.setProperty("--wave-y", y);
    }
  }

  useEffect(() => {
    document
      .querySelectorAll<HTMLElement>(
        '[class*="background-position-x:"], [class*="background-position-y:"]'
      )
      .forEach(applyBackgroundPositionFromClass);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === "attributes" &&
          m.attributeName === "class" &&
          m.target instanceof HTMLElement
        ) {
          applyBackgroundPositionFromClass(m.target);
        }
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n instanceof HTMLElement) {
              if (/\bbackground-position-[xy]:/.test(n.className)) {
                applyBackgroundPositionFromClass(n);
              }
              n.querySelectorAll<HTMLElement>(
                '[class*="background-position-x:"], [class*="background-position-y:"]'
              ).forEach(applyBackgroundPositionFromClass);
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const router = useRouter();
  const { t } = useTranslation("common");
  const prefersReducedMotion = useReducedMotion();
  const disableFallAnimation = Boolean(prefersReducedMotion);
  const [isFallActive, setIsFallActive] = useState(disableFallAnimation);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const totalFallItems = 6;
  const totalFallDuration =
    WORK_ITEM_TRANSITION_DURATION +
    Math.max(totalFallItems - 1, 0) * WORK_ITEM_STAGGER_DELAY;

  useNavigationExitDuration(totalFallItems, { variant: "work" });

  useEffect(() => {
    if (disableFallAnimation) {
      setIsFallActive(true);
      return undefined;
    }

    if (typeof window === "undefined") {
      return undefined;
    }

    const activateFall = () => {
      setIsFallActive(true);
      window.removeEventListener(APP_SHELL_REVEAL_EVENT, activateFall);
    };

    if (document.body?.dataset.preloading !== "true") {
      activateFall();
      return undefined;
    }

    window.addEventListener(APP_SHELL_REVEAL_EVENT, activateFall);

    return () => {
      window.removeEventListener(APP_SHELL_REVEAL_EVENT, activateFall);
    };
  }, [disableFallAnimation]);

  const fallStyle = (index: number) =>
    getFallItemStyle(isFallActive, index, totalFallItems, {
      disable: disableFallAnimation,
      variant: "work",
    });

  useEffect(() => {
    if (disableFallAnimation) {
      return undefined;
    }

    if (typeof window === "undefined") {
      return undefined;
    }

    const handleMenuOpen = () => {
      setIsFallActive(false);
    };

    const handleMenuClose = () => {
      if (isNavigatingAway) {
        return;
      }

      setIsFallActive(true);
    };

    window.addEventListener(APP_MENU_OPEN_EVENT, handleMenuOpen);
    window.addEventListener(APP_MENU_CLOSE_EVENT, handleMenuClose);

    return () => {
      window.removeEventListener(APP_MENU_OPEN_EVENT, handleMenuOpen);
      window.removeEventListener(APP_MENU_CLOSE_EVENT, handleMenuClose);
    };
  }, [disableFallAnimation, isNavigatingAway]);

  useEffect(() => {
    if (disableFallAnimation) {
      return undefined;
    }

    if (typeof window === "undefined") {
      return undefined;
    }

    const handleNavigationStart = () => {
      setIsNavigatingAway(true);
      setIsFallActive(false);
    };

    window.addEventListener(APP_NAVIGATION_START_EVENT, handleNavigationStart);

    return () => {
      window.removeEventListener(
        APP_NAVIGATION_START_EVENT,
        handleNavigationStart,
      );
    };
  }, [disableFallAnimation]);

  const handleHeroLinkClick = useCallback(
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

      if (disableFallAnimation) {
        return;
      }

      event.preventDefault();

      if (isNavigatingAway) {
        return;
      }

      navigateWithExit(router, href, {
        duration: totalFallDuration,
        onExitStart: () => {
          setIsNavigatingAway(true);
          setIsFallActive(false);
        },
      });
    },
    [disableFallAnimation, isNavigatingAway, router, totalFallDuration],
  );

  useThreeSceneSetup("home", { opacity: 1 });

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const { body, documentElement } = document;

    const previousOverflow = {
      bodyX: body.style.overflowX,
      bodyY: body.style.overflowY,
      htmlX: documentElement.style.overflowX,
      htmlY: documentElement.style.overflowY,
    };

    body.style.overflowX = "hidden";
    body.style.overflowY = "hidden";
    documentElement.style.overflowX = "hidden";
    documentElement.style.overflowY = "hidden";

    return () => {
      body.style.overflowX = previousOverflow.bodyX;
      body.style.overflowY = previousOverflow.bodyY;
      documentElement.style.overflowX = previousOverflow.htmlX;
      documentElement.style.overflowY = previousOverflow.htmlY;
    };
  }, []);

  return (
    <>
      <main className="w-front h-front relative z-30" data-fall-skip="true">
        <div>
          <div data-scroll-container="true" id="scroll-container">
            <div
              data-scroll-section="true"
              data-scroll-section-id="section0"
              data-scroll-section-inview=""
              className="transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);"
            >
              <div className="page-content">
                <div className="home">
                  <div className="intro-wrapper">
                    <div className="intro-text">
                      {/* título 1 */}
                      <h3 className="intro-id" style={fallStyle(0)}>
                        <Trans
                          i18nKey="home.hero.titleLine1"
                          components={{
                            name: (
                              <NameWithWave hoverVariant={HERO_LINE_ONE_MONOGRAM} />
                            ),
                          }}
                        />
                      </h3>

                      {/* título 2 */}
                      <h3 className="intro-id" style={fallStyle(1)}>
                        <Trans
                          i18nKey="home.hero.titleLine2"
                          components={{
                            name: (
                              <NameWithWave hoverVariant={HERO_LINE_TWO_MONOGRAM} />
                            ),
                          }}
                        />
                      </h3>

                      {/* roles */}
                      <div className="intro-roles">
                        <p className="intro-role" style={fallStyle(2)}>
                          {t("home.hero.role1")}
                        </p>
                        <p className="intro-role" style={fallStyle(3)}>
                          {t("home.hero.role2")}
                        </p>
                      </div>

                      {/* CTAs */}
                      <div className="intro-links">
                        <ul>
                          <li style={fallStyle(4)}>
                            <div className="link-wrapper">
                              <div className="link">
                                <Link
                                  href="/work"
                                  {...{ [EXIT_NAVIGATION_ATTRIBUTE]: "true" }}
                                  onClick={(event) =>
                                    handleHeroLinkClick(event, "/work")
                                  }
                                >
                                  <span>
                                    {t("home.hero.ctaProjects")}
                                  </span>
                                </Link>
                              </div>
                              <div
                                className="link-underline"
                                style={{
                                  transform: "translateX(-101%) translateZ(0)",
                                }}
                              />
                            </div>
                          </li>
                          <li style={fallStyle(5)}>
                            <div className="link-wrapper">
                              <div className="link">
                                <Link
                                  href="/about"
                                  {...{ [EXIT_NAVIGATION_ATTRIBUTE]: "true" }}
                                  onClick={(event) =>
                                    handleHeroLinkClick(event, "/about")
                                  }
                                >
                                  <span>
                                    {t("home.hero.ctaAbout")}
                                  </span>
                                </Link>
                              </div>
                              <div className="link-underline" />
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  {/* /intro-wrapper */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
