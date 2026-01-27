"use client";

import { useEffect } from "react";

import { getFallExitDuration } from "@/components/fallAnimation";

type NavigationExitOptions = {
  variant?: "default" | "work";
};

export const useNavigationExitDuration = (
  totalItems: number,
  { variant = "default" }: NavigationExitOptions = {},
) => {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const duration = getFallExitDuration(totalItems, variant);
    const { body } = document;
    const previous = body.dataset.navigationExitDuration;

    body.dataset.navigationExitDuration = String(duration);

    return () => {
      if (previous === undefined) {
        delete body.dataset.navigationExitDuration;
        return;
      }

      body.dataset.navigationExitDuration = previous;
    };
  }, [totalItems, variant]);
};
