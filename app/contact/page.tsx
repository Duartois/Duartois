"use client";

import { useTranslation } from "react-i18next";
import "../i18n/config";
import { useMenu } from "@/components/MenuContext";
import { useMenuFallAnimation } from "@/components/useMenuFallAnimation";
import { useThreeSceneSetup } from "@/app/helpers/useThreeSceneSetup";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const { isOpen: isMenuOpen } = useMenu();

  const mail = t("contact.mail", {
    returnObjects: true,
  }) as ContactMail;

  const socials = t("contact.socials", {
    returnObjects: true,
  }) as ContactSocials;

  const totalFallItems = 5 + socials.links.length;
  const fallStyle = useMenuFallAnimation(totalFallItems);
  useThreeSceneSetup("contact");
  let fallIndex = 0;
  const nextFall = () => fallStyle(fallIndex++);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const { body, documentElement } = document;

    const previousOverflow = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: documentElement.style.overflow,
      bodyPosition: body.style.position,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
    };

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.width = "100%";
    body.style.height = "100%";

    return () => {
      body.style.overflow = previousOverflow.bodyOverflow;
      documentElement.style.overflow = previousOverflow.htmlOverflow;
      body.style.position = previousOverflow.bodyPosition;
      body.style.width = previousOverflow.bodyWidth;
      body.style.height = previousOverflow.bodyHeight;
    };
  }, [pathname]);

  return (
    <main className="container contact-page">
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
                <div data-hero-index={0}>
                  <div className="page-head" style={nextFall()}>
                    <h2 className="page-title">{t("navigation.contact")}</h2>
                  </div>
                  <hr className="head-separator" style={nextFall()} />
                </div>

                <div className="contact-content">
                  <div className="contact-left" data-hero-index={1}>
                    <table>
                      <tbody>
                        <tr>
                          <td style={nextFall()}>
                            <h6>{mail.label}</h6>
                          </td>
                          <td style={nextFall()}>
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

                  <div className="contact-right" data-hero-index={2}>
                    <table>
                      <tbody>
                        <tr>
                          <td style={nextFall()}>
                            <h6>{socials.label}</h6>
                          </td>
                          <td>
                            <ul>
                              {socials.links.map((link) => (
                                <li key={link.href} style={nextFall()}>
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
