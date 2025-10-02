"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { useTranslation } from "react-i18next";
import "../i18n/config";

import { type VariantName } from "../../components/three/types";
import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";

const projectOrder = ["aurora", "mare", "spectrum"] as const;

type ProjectKey = (typeof projectOrder)[number];

type ProjectPreview = {
  variantName: VariantName;
  showDescription?: boolean;
};

const projectPreviews: Record<ProjectKey, ProjectPreview> = {
  aurora: {
    variantName: "home",
  },
  mare: {
    variantName: "about",
    showDescription: true,
  },
  spectrum: {
    variantName: "work",
  },
};

export default function WorkPage() {
  const { t } = useTranslation("common");
  const [activeProject, setActiveProject] = useState<ProjectKey>(projectOrder[0]);
  const shouldReduceMotion = useReducedMotion();

  const activePreview = projectPreviews[activeProject];

  useThreeSceneSetup("work", { resetOnUnmount: true });

  useEffect(() => {
    const preview = activePreview;
    window.__THREE_APP__?.setState({
      variantName: preview.variantName,
      parallax: false,
      hovered: true,
      opacity: 0.3,
    });
  }, [activePreview]);


  return (
    <>
      <Navbar />
    </>
  );
}
