"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const DISMISS_KEY = "shc_pwa_dismissed";

const MANUAL_INSTALL_HINT =
  "Tap the 3 dots menu in your browser, then tap 'Install app' or 'Add to Home screen'";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type WindowWithMSStream = Window & { MSStream?: unknown };
type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export function isIosSafari(userAgent: string, msStream: unknown) {
  return /iPad|iPhone|iPod/.test(userAgent) && !msStream;
}

export function isDisplayStandalone(displayModeStandalone: boolean, navigatorStandalone: unknown) {
  return displayModeStandalone || navigatorStandalone === true;
}

function readInstallGate() {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as WindowWithMSStream).MSStream;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as NavigatorWithStandalone).standalone === true;
  const dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
  return { isIOS, hidden: isStandalone || dismissed };
}

export function dismissInstallBanner() {
  window.localStorage.setItem(DISMISS_KEY, "1");
}

export function InstallAppBannerCard({
  platform,
  manualHint,
  onInstall,
  onDismiss,
}: {
  platform: "ios" | "android";
  manualHint: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 bg-white border border-zinc-200 rounded-3xl p-5 shadow-2xl">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss install prompt"
        className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl text-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:scale-[0.98] touch-manipulation"
      >
        ✕
      </button>
      <div className="flex items-start gap-3 pr-10">
        <Image
          src="/icon-192x192.png"
          alt=""
          width={48}
          height={48}
          unoptimized
          className="h-12 w-12 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-zinc-900">Install SportsHistoryClue</p>
          {platform === "ios" ? (
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-zinc-600">
              <p>To install this app on your iPhone/iPad:</p>
              <p>
                1. Tap the Share button in Safari toolbar <span aria-hidden>⎋</span>
              </p>
              <p>2. Scroll down and tap &apos;Add to Home Screen&apos; (+)</p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onInstall}
                className="mt-3 min-h-[48px] w-full touch-manipulation rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 active:scale-[0.98]"
              >
                Install App
              </button>
              {manualHint ? (
                <p className="mt-3 text-xs leading-relaxed text-zinc-500">{MANUAL_INSTALL_HINT}</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function InstallAppBanner() {
  const [hidden, setHidden] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [manualHint, setManualHint] = useState(false);

  useEffect(() => {
    const sync = () => {
      const gate = readInstallGate();
      setIsIOS(gate.isIOS);
      setHidden(gate.hidden);
    };
    sync();
    const standalone = window.matchMedia("(display-mode: standalone)");
    standalone.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      standalone.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;

  return (
    <InstallAppBannerCard
      platform={isIOS ? "ios" : "android"}
      manualHint={manualHint}
      onInstall={() => {
        if (!deferredPrompt) {
          setManualHint(true);
          return;
        }
        const prompt = deferredPrompt;
        void prompt.prompt().then(async () => {
          const choice = await prompt.userChoice;
          setDeferredPrompt(null);
          if (choice.outcome === "accepted") {
            dismissInstallBanner();
            setHidden(true);
            return;
          }
          setManualHint(true);
        });
      }}
      onDismiss={() => {
        dismissInstallBanner();
        setHidden(true);
      }}
    />
  );
}
