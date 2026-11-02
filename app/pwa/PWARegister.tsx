"use client";

import { useEffect } from "react";

const PWARegister = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) => registration.unregister()),
          ),
        )
        .then(() => caches?.keys?.())
        .then((keys) =>
          keys ? Promise.all(keys.map((key) => caches.delete(key))) : undefined,
        )
        .catch(() => {
          // Ignora erros de limpeza em ambiente de desenvolvimento.
        });

      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.error("Falha ao registrar o service worker", error);
      }
    };

    // Register once the page has finished loading so the worker's install work
    // (precaching the app shell) never competes with the first render.
    if (document.readyState === "complete") {
      void registerServiceWorker();
      return;
    }

    const handleLoad = () => {
      void registerServiceWorker();
    };
    window.addEventListener("load", handleLoad, { once: true });

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return null;
};

export default PWARegister;
