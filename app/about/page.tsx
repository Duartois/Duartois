"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";

export default function AboutPage() {
  const { t } = useTranslation("common");
  const { isOpen: isMenuOpen } = useMenu();
  const fallStyle = useMenuFallAnimation(2);

  useThreeSceneSetup("about");

  useEffect(() => {
    window.__THREE_APP__?.setState({ opacity: isMenuOpen ? 1 : 0.3 });
  }, [isMenuOpen]);

  return (
    <main
      className="page-content"
      style={{
        pointerEvents: isMenuOpen ? "none" : "auto",
        opacity: isMenuOpen ? 0 : 1,
        transition: "opacity 300ms ease",
      }}
      aria-hidden={isMenuOpen}
    >
      <div className="about">
        <div className="about-right" data-hero-index={0} style={fallStyle(0)}>
          <div className="profile-pic-wrapper">
            <img
              alt={t("about.portraitAlt")}
              src="https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rst67bqmro07urdf8a8sgu"
              className="profile-pic"
            />
          </div>

          <div className="miniplayer-wrapper">
            <div className="miniplayer-border">
              <img
                src="/miniplayer-border.svg"
                alt=""
                className="miniplayer-border-svg"
                aria-hidden
              />
            </div>
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: "12px" }}
              src="https://open.spotify.com/embed/track/7oOOI85fVQvVnK5ynNMdW7?utm_source=generator"
              width="100%"
              height="152"
              frameBorder={0}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

        <div className="about-left" data-hero-index={1} style={fallStyle(1)}>
          <div>
            <div className="page-head">
              <h2 className="page-title">{t("navigation.about")}</h2>
            </div>
            <hr className="head-separator" />
          </div>
          <p className="presentation-text">{t("about.presentation")}</p>
          <div className="resume-link">
            <div className="link-wrapper">
              <div className="link">
                <a href={t("about.resumeUrl")} target="_blank" rel="noreferrer">
                  {t("about.cta.resume")}
                </a>
              </div>
              <div className="link-underline" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
