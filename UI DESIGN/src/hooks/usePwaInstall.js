import { useState, useEffect, useCallback } from "react";

/**
 * usePwaInstall - Custom React Hook for PWA installation handling.
 * Supports Chrome, Edge, Android browsers, and iOS Safari Add-to-Home-Screen workflows.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // 1. Check if application is already running in standalone display mode
    const checkIsInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(Boolean(isStandalone));
    };

    checkIsInstalled();
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e) => {
      setIsInstalled(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleDisplayModeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleDisplayModeChange);
    }

    // 2. Detect iOS / iPadOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafariBrowser =
      /safari/.test(ua) && !/chrome|crios|crmo|android|fxios/.test(ua);

    setIsIos(isIosDevice);
    setIsSafari(isSafariBrowser);

    // 3. Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent automatic mini-infobar on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 4. Capture appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.info("[PWA] NegoMind AI was installed successfully.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 5. Register Service Worker in production or localhost
    if (
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.debug("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.debug("[PWA] Service Worker registration failed:", err);
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleDisplayModeChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  /**
   * Triggers the install prompt or returns platform-specific install details.
   */
  const promptInstall = useCallback(async () => {
    // Case B: Already running in installed standalone mode
    if (isInstalled) {
      return { status: "already_installed" };
    }

    // Case A: Native browser install prompt available (Chrome, Edge, Samsung Internet, Android)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setIsInstallable(false);
        return {
          status: choiceResult.outcome === "accepted" ? "accepted" : "dismissed",
        };
      } catch (err) {
        console.warn("[PWA] Error displaying install prompt:", err);
        return { status: "error", error: err };
      }
    }

    // Case C: iOS / iPadOS Safari (requires manual Add to Home Screen)
    if (isIos) {
      return { status: "ios_safari" };
    }

    // Case D & E: Install prompt not yet exposed or browser unsupported
    return { status: "prompt_unavailable" };
  }, [deferredPrompt, isInstalled, isIos]);

  return {
    isInstallable,
    isInstalled,
    isIos,
    isSafari,
    promptInstall,
  };
}
