"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";

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

export default function ContactPage() {
  const { t } = useTranslation("common");
  const { isOpen: isMenuOpen } = useMenu();
  const fallStyle = useMenuFallAnimation(3);

  useThreeSceneSetup("contact");

  useEffect(() => {
    window.__THREE_APP__?.setState({ opacity: isMenuOpen ? 1 : 0.3 });
  }, [isMenuOpen]);

  const mail = t("contact.mail", {
    returnObjects: true,
  }) as ContactMail;

  const socials = t("contact.socials", {
    returnObjects: true,
  }) as ContactSocials;

  return (
    <main className="container">
      <div
        style={{
          pointerEvents: isMenuOpen ? "none" : "auto",
          opacity: isMenuOpen ? 0 : 1,
          transition: "opacity 300ms ease",
        }}
        aria-hidden={isMenuOpen}
      >
        <div data-scroll-container="true" id="scroll-container">
          <div data-scroll-section="true">
            <div className="page-content" style={{ pointerEvents: "auto" }}>
              <div className="contact">
                <div data-hero-index={0} style={fallStyle(0)}>
                  <div className="page-head">
                    <h2 className="page-title">{t("navigation.contact")}</h2>
                  </div>
                  <hr className="head-separator" />
                </div>

                <div className="contact-content">
                  <div
                    className="contact-left"
                    data-hero-index={1}
                    style={fallStyle(1)}
                  >
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <h6>{mail.label}</h6>
                          </td>
                          <td>
                            <div className="link-wrapper">
                              <div className="link">
                                <a
                                  href={mail.href}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  ↗ {mail.address}
                                </a>
                              </div>
                              <div className="link-underline" />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div
                    className="contact-right"
                    data-hero-index={2}
                    style={fallStyle(2)}
                  >
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <h6>{socials.label}</h6>
                          </td>
                          <td>
                            <ul>
                              {socials.links.map((link) => (
                                <li key={link.href}>
                                  <div className="link-wrapper">
                                    <div className="link">
                                      <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        ↗ {link.label}
                                      </a>
                                    </div>
                                    <div className="link-underline" />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
