"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { setPwaInstallPromptSeen } from "@/app/store/uiSlice";

const PWARegister = () => {
  const dispatch = useAppDispatch();

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

    const handleBeforeInstallPrompt = () => {
      dispatch(setPwaInstallPromptSeen(true));
    };

    registerServiceWorker();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [dispatch]);

  return null;
};

export default PWARegister;
