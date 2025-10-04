"use client";

import { useTranslation, Trans } from "react-i18next";
import "./i18n/config";
import { useThreeSceneSetup } from "./helpers/useThreeSceneSetup";
import {
  useEffect,
  PropsWithChildren,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

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
      className="name fall-down-element"
      style={{ "--fall-delay": "0.1s" } as CSSProperties}
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

  const { t } = useTranslation("common");
  useThreeSceneSetup("home", { opacity: 1 });

  return (
    <>
      <main className="w-front h-front relative z-30">
        <div className="opacity: 1; transform: none;">
          <div data-scroll-container="true" id="scroll-container">
            <div
              data-scroll-section="true"
              data-scroll-section-id="section0"
              data-scroll-section-inview=""
              className="transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); opacity: 1; pointer-events: all;"
            >
              <div className="page-content pointer-events: auto;">
                <div className="home">
                  <div className="intro-wrapper">
                    <div className="intro-text">
                      {/* título 1 */}
                      <h3
                        className="intro-id fall-down-element opacity: 1; transform: none;"
                      >
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
                      <h3
                        className="intro-id fall-down-element opacity: 1; transform: none;"
                        style={{ "--fall-delay": "0.4s" } as CSSProperties}
                      >
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
                        <p
                          className="intro-role fall-down-element opacity: 1; transform: none;"
                          style={{ "--fall-delay": "0.8s" } as CSSProperties}
                        >
                          {t("home.hero.role1")}
                        </p>
                        <p
                          className="intro-role fall-down-element opacity: 1; transform: none;"
                          style={{ "--fall-delay": "1.1s" } as CSSProperties}
                        >
                          {t("home.hero.role2")}
                        </p>
                      </div>

                      {/* CTAs */}
                      <div className="intro-links">
                        <ul>
                          <li className="opacity: 1">
                            <div className="link-wrapper">
                              <div className="link">
                                <a href="/work">
                                  <span
                                    className="fall-down-element"
                                    style={{ "--fall-delay": "1.3s" } as CSSProperties}
                                  >
                                    {t("home.hero.ctaProjects")}
                                  </span>
                                </a>
                              </div>
                              <div className="link-underline transform: translateX(-101%) translateZ(0px);" />
                            </div>
                          </li>
                          <li className="opacity: 1">
                            <div className="link-wrapper">
                              <div className="link">
                                <a href="/about">
                                  <span
                                    className="fall-down-element"
                                    style={{ "--fall-delay": "1.3s" } as CSSProperties}
                                  >
                                    {t("home.hero.ctaAbout")}
                                  </span>
                                </a>
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
        <div className="noise" />
      </main>
    </>
  );
}