"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";
import { Trans, useTranslation } from "react-i18next";
import Image from "next/image";
import "../i18n/config";

import { useThreeSceneSetup } from "../helpers/useThreeSceneSetup";

export default function AboutPage() {
  const { t } = useTranslation("common");

  useThreeSceneSetup("about");

  return (
    <>
    </>
  );
}
