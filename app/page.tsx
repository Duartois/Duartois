"use client";

import { Trans, useTranslation } from "react-i18next";
import "./i18n/config";
import { useThreeSceneSetup } from "./helpers/useThreeSceneSetup";
import { ReactNode, useEffect } from "react";


export default function HomePage() {
  const applyBackgroundPositionFromClass = (el: HTMLElement) => {
    const cls = el.className || "";
    const rxX = /background-position-x:\s*([+-]?\d*\.?\d+)px/;
    const rxY = /background-position-y:\s*([+-]?\d*\.?\d+)px/;

    const mx = cls.match(rxX);
    if (mx) {
      const x = `${parseFloat(mx[1])}px`;
      el.style.backgroundPositionX = x;
      // expõe o valor inicial para os @keyframes via CSS var
      el.style.setProperty("--wave-x", x);
    }

    const my = cls.match(rxY);
    if (my) {
      const y = `${parseFloat(my[1])}px`;
      el.style.backgroundPositionY = y;
      // (se um dia animar Y também, já fica preparado)
      el.style.setProperty("--wave-y", y);
    }
  };

  const NameHighlight = ({
    children,
    waveClassName,
  }: {
    children: ReactNode;
    waveClassName: string;
  }) => (
    <div className="name">
      {children}
      <div className="wave-wrapper">
        <div className={waveClassName} />
      </div>
    </div>
  );

  useEffect(() => {
    // aplica imediatamente em todos que já vieram do SSR
    document
      .querySelectorAll<HTMLElement>('[class*="background-position-x:"], [class*="background-position-y:"]')
      .forEach(applyBackgroundPositionFromClass);

    // observa mudanças futuras (classe trocada ou elementos inseridos)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class" && m.target instanceof HTMLElement) {
          applyBackgroundPositionFromClass(m.target);
        }
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n instanceof HTMLElement) {
              if (/\bbackground-position-[xy]:/.test(n.className)) {
                applyBackgroundPositionFromClass(n);
              }
              // também procura descendentes
              n.querySelectorAll<HTMLElement>('[class*="background-position-x:"], [class*="background-position-y:"]')
               .forEach(applyBackgroundPositionFromClass);
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
<main className="w-front">
  <div className="opacity: 1; transform: none;">
    <div data-scroll-container="true" id="scroll-container">
      <div data-scroll-section="true" data-scroll-section-id="section0" data-scroll-section-inview="" className="transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); opacity: 1; pointer-events: all;">
        <div className="page-content pointer-events: auto;">
          <div className="home">
            <div className="intro-wrapper">
              <div className="intro-text">
                <h3 className="intro-id opacity: 1; transform: none; ">
                  <Trans
                    i18nKey="home.hero.titleLine1"
                    components={{
                      name: (
                        <NameHighlight waveClassName="wave background-position-x: 54.6645px;" />
                      ),
                    }}
                  />
                </h3>
                <h3 className="intro-id opacity: 1; transform: none;">
                  <Trans
                    i18nKey="home.hero.titleLine2"
                    components={{
                      name: (
                        <NameHighlight waveClassName="wave background-position-x: 79.1168px;" />
                      ),
                    }}
                  />
                </h3>
                <div className="intro-roles">
                  <p className="intro-role opacity: 1; transform: none;">
                    {t("home.hero.role1")}
                  </p>
                  <p className="intro-role opacity: 1; transform: none;">
                    {t("home.hero.role2")}
                  </p>
                </div>
                <div className="intro-links">
                  <ul>
                    <li className="opacity: 1">
                      <div className="link-wrapper">
                        <div className="link">
                          <a href="/work">
                            {t("home.hero.ctaProjects")}
                          </a>
                        </div>
                        <div className="link-underline transform: translateX(-101%) translateZ(0px);">
                        </div>
                      </div>
                    </li>
                    <li className="opacity: 1">
                      <div className="link-wrapper">
                        <div className="link">
                          <a href="/about">
                            {t("home.hero.ctaAbout")}
                          </a>
                        </div>
                        <div className="link-underline">
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

    </>
  );
} 
