"use client";

import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import "./i18n/config";

import noiseUrl from "@/public/noise.png";
import { useThreeSceneSetup } from "./helpers/useThreeSceneSetup";

export default function HomePage() {
  const { t } = useTranslation("common");

  useThreeSceneSetup("home", { opacity: 1 });

  return (
    <>
<main className="container">
  <div className="opacity: 1; transform: none;">
    <div data-scroll-container="true" id="scroll-container">
      <div data-scroll-section="true" data-scroll-section-id="section0" data-scroll-section-inview="" className="transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); opacity: 1; pointer-events: all;">
        <div className="page-content pointer-events: auto;">
          <div className="home">
            <div className="intro-wrapper">
              <div className="intro-text">
                <h3 className="intro-id opacity: 1; transform: none;">
                  Hey, I’m 
                  <div className="name">Charles Bruyerre
                    <div className="wave-wrapper">
                      <div className="wave background-position-x: 54.6645px;">
                      </div>
                    </div>
                  </div>
                </h3>
                <h3 className="intro-id opacity: 1; transform: none;">
                  But you can call me 
                  <div className="name">
                    Sharlee
                    <div className="wave-wrapper">
                      <div className="wave background-position-x: 79.1168px;">
                      </div>
                    </div>
                  </div>
                </h3>
                <div className="intro-roles">
                  <p className="intro-role opacity: 1; transform: none;">
                    I’m a graphic designer, UX/UI designer
                  </p>
                  <p className="intro-role opacity: 1; transform: none;">
                    &amp; front-end web developer
                  </p>
                </div>
                <div className="intro-links">
                  <ul>
                    <li className="opacity: 1; transform: none;">
                      <div className="link-wrapper">
                        <div className="link">
                          <a href="/work">
                            →See my projects
                          </a>
                        </div>
                        <div className="link-underline transform: translateX(-101%) translateZ(0px);">
                        </div>
                      </div>
                    </li>
                    <li className="opacity: 1; transform: none;">
                      <div className="link-wrapper">
                        <div className="link">
                          <a href="/about">
                          →More about me
                          </a>
                        </div>
                        <div className="link-underline transform: translateX(-101%) translateZ(0px);">
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
