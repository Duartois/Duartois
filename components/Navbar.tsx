"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Menu from "./Menu";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "react-i18next";
import "../app/i18n/config";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoverHold, setHoverHold] = useState(false);
  const animTimerRef = useRef<number | undefined>(undefined);
  const pathname = usePathname();
  useEffect(() => setIsOpen(false), [pathname]);
  const { t } = useTranslation("common");

  function handleToggle() {
    setIsAnimating(true);
    setHoverHold(true); // <- trava hover no clique
    setIsOpen((v) => !v);

    if (animTimerRef.current) window.clearTimeout(animTimerRef.current);
    animTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
    }, 420);
  }

  return (
    <>
      <header>
        <div className="header-content">
          {/* LEFT */}
          <div className="left-part flex transform-none">
            <div className="logo">
              <Link href="/" aria-label="Home">
                <span className="visually-hidden">Home</span>
                <svg
                  data-name="logoItem"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="48"
                  height="48"
                  className="icons-style"
                >
                  <path d="M15.014,25.68A3.544,3.544,0,0,1,12.5,26.721a4.39,4.39,0,1,1-4.389,4.39,3.556,3.556,0,1,0-7.111,0A11.5,11.5,0,1,0,14.351,19.773a4.373,4.373,0,0,0,.663.879A3.556,3.556,0,0,1,15.014,25.68Z"></path>
                  <path d="M35.5,27.555a11.481,11.481,0,0,0-1.838.161,11.549,11.549,0,0,1,.246,2.334,11.432,11.432,0,0,1-2.029,6.522l-.012.021a4.389,4.389,0,0,1,8.022,2.462,3.556,3.556,0,1,0,7.111,0A11.5,11.5,0,0,0,35.5,27.555Z"></path>
                  <path d="M33.662,27.716a11.475,11.475,0,0,0-3.8-6.424,4.389,4.389,0,0,1-.775-5.826,11.43,11.43,0,0,0,2.028-6.521A3.546,3.546,0,0,0,24.206,7.8a11.431,11.431,0,0,1,2.043,1.615,3.548,3.548,0,0,1-4.6,5.377,11.471,11.471,0,0,0,3.6,11.914,4.389,4.389,0,0,1,.775,5.826c-.013.018-.023.037-.036.055-.04.059-.075.121-.114.18-.148.227-.29.457-.422.694-.048.087-.095.176-.141.264q-.181.345-.339.7c-.034.076-.069.152-.1.229a11.485,11.485,0,0,0-.62,2c-.015.074-.028.149-.042.223-.054.282-.1.568-.131.856-.009.078-.019.156-.026.234-.034.358-.055.719-.055,1.085a3.555,3.555,0,1,0,7.109,0,4.45,4.45,0,0,1,.083-.81c.012-.065.029-.127.044-.19a4.2,4.2,0,0,1,.184-.593c.024-.061.045-.122.072-.182a4.344,4.344,0,0,1,.343-.632c.012-.018.02-.037.032-.055l.012-.021a11.432,11.432,0,0,0,2.029-6.522A11.549,11.549,0,0,0,33.662,27.716Z"></path>
                  <path d="M26.249,9.417A11.5,11.5,0,0,0,9.986,25.68a3.585,3.585,0,0,0,.542.443c.087.058.185.1.277.15a3.453,3.453,0,0,0,.335.176,3.641,3.641,0,0,0,.363.113c.1.029.2.069.3.089a3.554,3.554,0,0,0,3.21-6,4.389,4.389,0,0,1,6.207-6.207,3.607,3.607,0,0,0,.428.349,3.548,3.548,0,0,0,4.6-5.377Z"></path>
                </svg>
              </Link>
            </div>

            <h5
              className="full-identity"
              style={{
                display: "none",
                transform: "translateY(-100px) translateZ(0px)",
              }}
            >
              <span className="nickname">sharlee</span>/
              <span className="fullname">charles bruyerre</span>
            </h5>
          </div>

          {/* RIGHT */}
          <div
            className="right-part"
            style={{ display: "flex", transform: "none" }}
          >
            <ul>
              {/* LanguageSwitcher no lugar do EN/PT estático */}
              <li
                className="language-switch flex transform-none"
                style={{ display: "block", transform: "none" }}
              >
                <LanguageSwitcher />
              </li>

              {/* ThemeToggle usando o mesmo ícone (lua/sol) da referência */}
              <li
                className="theme-switch"
                style={{ display: "block", transform: "none" }}
              >
                <ThemeToggle />
              </li>

              {/* Botão do menu (9 pontos) */}
              <li>
                <button
                  className="hamburger-btn"
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={isOpen}
                  aria-controls="main-navigation-overlay"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  data-open={isOpen}
                  data-animating={isAnimating}
                  data-hover-hold={hoverHold}
                  onClick={handleToggle}
                  onMouseLeave={() => setHoverHold(false)}
                  onBlur={() => setHoverHold(false)}
                >
                  <div style={{ transform: "none" }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="48"
                      height="48"
                      className="icons-style menu-icon"
                      aria-hidden="true"
                    >
                      <title>Menu</title>

                      {/* linha de cima */}
                      <circle cx="12" cy="12" r="3" className="dot dot-12-12" />
                      <circle cx="24" cy="12" r="3" className="dot dot-24-12" />
                      <circle cx="36" cy="12" r="3" className="dot dot-36-12" />

                      {/* meio (os lados são círculos, o centro é quadrado arredondado) */}
                      <circle cx="12" cy="24" r="3" className="dot dot-12-24" />
                      <circle cx="36" cy="24" r="3" className="dot dot-36-24" />

                      {/* linha de baixo */}
                      <circle cx="12" cy="36" r="3" className="dot dot-12-36" />
                      <circle cx="24" cy="36" r="3" className="dot dot-24-36" />
                      <circle cx="36" cy="36" r="3" className="dot dot-36-36" />
                      <g className="center-bars">
                        <rect
                          x="21"
                          y="21"
                          width="6"
                          height="6"
                          rx="3"
                          ry="3"
                          opacity="0.75"
                          className="dot-center-w"
                        />
                        <rect
                          x="21"
                          y="21"
                          width="6"
                          height="6"
                          rx="3"
                          ry="3"
                          opacity="0.75"
                          className="dot-center-h"
                        />
                      </g>
                    </svg>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <Menu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
