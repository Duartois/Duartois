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
    const previousItems = body.dataset.navigationExitItems;

    body.dataset.navigationExitDuration = String(duration);
    body.dataset.navigationExitItems = String(totalItems);

    return () => {
      if (previous === undefined) {
        delete body.dataset.navigationExitDuration;
      } else {
        body.dataset.navigationExitDuration = previous;
      }

      if (previousItems === undefined) {
        delete body.dataset.navigationExitItems;
        return;
      }

      body.dataset.navigationExitItems = previousItems;
    };
  }, [totalItems, variant]);
};
