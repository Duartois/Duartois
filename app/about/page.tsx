"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";
import { useTheme } from "../theme/ThemeContext";

type ContactMail = {
  label: string;
  address: string;
  href: string;
};

type ContactSocialLink = {
  label: string;
  href: string;
};

type ContactSocials = {
  label: string;
  links: ContactSocialLink[];
};

export default function AboutPage() {
  const { t } = useTranslation("common");
  const { isOpen: isMenuOpen } = useMenu();
  const fallStyle = useMenuFallAnimation(3);
  const { theme } = useTheme();

  const spotifyAccent = theme === "dark" ? "F3F2F9" : "606887";
  const spotifyEmbedUrl =
    "https://open.spotify.com/embed/track/7oOOI85fVQvVnK5ynNMdW7?utm_source=generator&color=%23" +
    spotifyAccent;

  const mail = t("contact.mail", {
    returnObjects: true,
  }) as ContactMail;
  const socials = t("contact.socials", {
    returnObjects: true,
  }) as ContactSocials;

  useThreeSceneSetup("about");

  useEffect(() => {
    window.__THREE_APP__?.setState({ opacity: isMenuOpen ? 1 : 0.3 });
  }, [isMenuOpen]);

  useEffect(() => {
    const originalRequestMediaKeySystemAccess =
      navigator.requestMediaKeySystemAccess;

    if (!originalRequestMediaKeySystemAccess) {
      return;
    }

    const patchedRequestMediaKeySystemAccess: Navigator["requestMediaKeySystemAccess"] = (
      keySystem,
      configurations,
    ) => {
      const patchedConfigurations = Array.from(
        configurations,
        (configuration): MediaKeySystemConfiguration => {
          if (!configuration.videoCapabilities?.length) {
            return configuration;
          }

          const videoCapabilities = configuration.videoCapabilities.map(
            (capability): MediaKeySystemMediaCapability => {
              if (capability.robustness) {
                return capability;
              }

              return {
                ...capability,
                robustness: "SW_SECURE_DECODE",
              } satisfies MediaKeySystemMediaCapability;
            },
          );

          return {
            ...configuration,
            videoCapabilities,
          } satisfies MediaKeySystemConfiguration;
        },
      );

      return originalRequestMediaKeySystemAccess.call(
        navigator,
        keySystem,
        patchedConfigurations,
      );
    };

    navigator.requestMediaKeySystemAccess = patchedRequestMediaKeySystemAccess;

    return () => {
      navigator.requestMediaKeySystemAccess = originalRequestMediaKeySystemAccess;
    };
  }, []);

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
              src="/about-01.avif"
              className="profile-pic"
            />
          </div>
        </div>

        <div className="about-left" data-hero-index={1} style={fallStyle(1)}>
          <div>
            <div className="page-head">
              <h2 className="page-title">{t("navigation.about")}</h2>
              <div className="page-head-miniplayer" data-testid="miniplayer">
                <iframe
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  data-testid="embed-iframe"
                  height={80}
                  loading="lazy"
                  key={theme}
                  src={spotifyEmbedUrl}
                  style={{ borderRadius: "12px" }}
                  title="Abracadabra - Lady Gaga"
                  width="100%"
                />
              </div>
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
