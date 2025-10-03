"use client";

import { useTranslation, Trans } from "react-i18next";
import "./i18n/config";
import { useThreeSceneSetup } from "./helpers/useThreeSceneSetup";
import { useEffect, PropsWithChildren } from "react";

// componente para estilizar o <name> vindo do JSON
function NameWithWave({ children }: PropsWithChildren) {
  return (
    <span className="name">
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
      <main className="relative z-[70] w-front">
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
                      <h3 className="intro-id opacity: 1; transform: none;">
                        <Trans
                          i18nKey="home.hero.titleLine1"
                          components={{ name: <NameWithWave /> }}
                        />
                      </h3>

                      {/* título 2 */}
                      <h3 className="intro-id opacity: 1; transform: none;">
                        <Trans
                          i18nKey="home.hero.titleLine2"
                          components={{ name: <NameWithWave /> }}
                        />
                      </h3>

                      {/* roles */}
                      <div className="intro-roles">
                        <p className="intro-role opacity: 1; transform: none;">
                          {t("home.hero.role1")}
                        </p>
                        <p className="intro-role opacity: 1; transform: none;">
                          {t("home.hero.role2")}
                        </p>
                      </div>

                      {/* CTAs */}
                      <div className="intro-links">
                        <ul>
                          <li className="opacity: 1">
                            <div className="link-wrapper">
                              <div className="link">
                                <a href="/work">{t("home.hero.ctaProjects")}</a>
                              </div>
                              <div className="link-underline transform: translateX(-101%) translateZ(0px);" />
                            </div>
                          </li>
                          <li className="opacity: 1">
                            <div className="link-wrapper">
                              <div className="link">
                                <a href="/about">{t("home.hero.ctaAbout")}</a>
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
