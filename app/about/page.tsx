"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";
import { useTheme } from "../theme/ThemeContext";
import { getShimmerDataURL } from "../helpers/imagePlaceholders";

export default function AboutPage() {
  const { t } = useTranslation("common");
  const { isOpen: isMenuOpen } = useMenu();
  const fallStyle = useMenuFallAnimation(5);
  const { theme } = useTheme();
  const portraitPlaceholder = getShimmerDataURL(900, 1200);

  const spotifyAccent = theme === "dark" ? "F3F2F9" : "606887";
  const spotifyEmbedUrl =
    "https://open.spotify.com/embed/track/7oOOI85fVQvVnK5ynNMdW7?utm_source=generator&color=%23" +
    spotifyAccent;

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

  let fallIndex = 0;
  const nextFall = () => fallStyle(fallIndex++);

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
        <div className="about-right" data-hero-index={0} style={nextFall()}>
          <div className="profile-pic-wrapper">
            <Image
              alt={t("about.portraitAlt")}
              src="/about-01.avif"
              className="profile-pic"
              fill
              sizes="(max-width: 61.99em) 100vw, 50vw"
              priority
              fetchPriority="high"
              placeholder="blur"
              blurDataURL={portraitPlaceholder}
              quality={90}
            />
          </div>
        </div>

        <div className="about-left" data-hero-index={1}>
          <div style={nextFall()}>
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
          </div>
          <hr className="head-separator" style={nextFall()} />
          <p className="presentation-text" style={nextFall()}>
            {t("about.presentation")}
          </p>
          <div className="resume-link" style={nextFall()}>
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
