"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { isPerfDebugEnabled, logPerf } from "@/app/helpers/perfDebug";

const IMAGE_INITIATORS = new Set(["img", "image"]);

const formatKb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

export default function PerfDebugLogger() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPerfDebugEnabled || typeof window === "undefined") {
      return;
    }

    const observerSupported = "PerformanceObserver" in window;

    if (!observerSupported) {
      logPerf("PerformanceObserver not supported in this browser.");
      return;
    }

    const entries: PerformanceResourceTiming[] = [];
    const observer = new PerformanceObserver((list) => {
      list
        .getEntries()
        .filter((entry): entry is PerformanceResourceTiming =>
          "initiatorType" in entry,
        )
        .forEach((entry) => entries.push(entry));
    });

    observer.observe({ type: "resource", buffered: true });

    const timeoutId = window.setTimeout(() => {
      const imageEntries = entries.filter((entry) =>
        IMAGE_INITIATORS.has(entry.initiatorType),
      );
      const uniqueImages = new Set(imageEntries.map((entry) => entry.name));
      const totalBytes = imageEntries.reduce(
        (sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0),
        0,
      );

      logPerf("Images loaded for route", {
        route: pathname,
        count: uniqueImages.size,
        totalBytes,
        totalSize: formatKb(totalBytes),
      });
    }, 3000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isPerfDebugEnabled || typeof window === "undefined") {
      return;
    }

    const navigationEntries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    const navigationStart = navigationEntries[0]?.startTime ?? 0;
    const logContentVisible = () => {
      const contentMarks = performance.getEntriesByName("app:content-visible");

      if (contentMarks.length > 0) {
        const mark = contentMarks[0];
        logPerf("First content visible", {
          timeMs: Math.round(mark.startTime - navigationStart),
        });
        return true;
      }

      return false;
    };

    let timeoutId: number | undefined;
    if (!logContentVisible()) {
      timeoutId = window.setTimeout(() => {
        logContentVisible();
      }, 600);
    }

    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          logPerf("First contentful paint", {
            timeMs: Math.round(entry.startTime - navigationStart),
          });
        }
      });
    });

    paintObserver.observe({ type: "paint", buffered: true });

    return () => {
      paintObserver.disconnect();
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return null;
}
