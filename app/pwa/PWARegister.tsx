"use client";

import { useEffect } from "react";

const PWARegister = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.error("Falha ao registrar o service worker", error);
      }
    };

    registerServiceWorker();
  }, []);

  return null;
};

export default PWARegister;
