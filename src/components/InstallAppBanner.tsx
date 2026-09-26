"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";

const DISMISS_KEY = "shc_pwa_dismissed";
const DISMISS_EVENT = "shc-pwa-dismiss";

type BannerMode = "hidden" | "ios" | "android";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function subscribe(onStoreChange: () => void) {
  const standalone = window.matchMedia("(display-mode: standalone)");
  const narrow = window.matchMedia("(max-width: 768px)");
  standalone.addEventListener("change", onStoreChange);
  narrow.addEventListener("change", onStoreChange);
  window.addEventListener(DISMISS_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    standalone.removeEventListener("change", onStoreChange);
    narrow.removeEventListener("change", onStoreChange);
    window.removeEventListener(DISMISS_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readBannerMode(): BannerMode {
  if (window.localStorage.getItem(DISMISS_KEY) === "1") return "hidden";
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
  if (standalone) return "hidden";
  const mobile =
    window.matchMedia("(max-width: 768px)").matches ||
    /Android|iPhone|iPad|iPod/i.test(nav.userAgent);
  if (!mobile) return "hidden";
  const ios =
    /iPad|iPhone|iPod/.test(nav.userAgent) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
  return ios ? "ios" : "android";
}

export function dismissInstallBanner() {
  window.localStorage.setItem(DISMISS_KEY, "1");
  window.dispatchEvent(new Event(DISMISS_EVENT));
}

export function InstallAppBannerCard({
  platform,
  canInstall,
  onInstall,
  onDismiss,
}: {
  platform: "ios" | "android";
  canInstall: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-4 mb-4 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg">
        <Image
          src="/icon-192x192.png"
          alt=""
          width={48}
          height={48}
          unoptimized
          className="h-12 w-12 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-zinc-900">Install Stadium App</p>
          {platform === "ios" ? (
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Tap Share (⎙ / ⎋) then &apos;Add to Home Screen&apos; (+).
            </p>
          ) : (
            <button
              type="button"
              onClick={onInstall}
              disabled={!canInstall}
              className="mt-2 min-h-[48px] touch-manipulation rounded-xl bg-blue-600 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
            >
              Install
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss install prompt"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:scale-[0.98] touch-manipulation"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function InstallAppBanner() {
  const mode = useSyncExternalStore(subscribe, readBannerMode, () => "hidden" as const);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (mode === "hidden") return null;

  return (
    <>
      <div className="h-32 md:hidden" aria-hidden />
      <InstallAppBannerCard
        platform={mode}
        canInstall={promptEvent != null}
        onInstall={() => {
          if (!promptEvent) return;
          void promptEvent.prompt().then(async () => {
            const choice = await promptEvent.userChoice;
            setPromptEvent(null);
            if (choice.outcome === "accepted") dismissInstallBanner();
          });
        }}
        onDismiss={dismissInstallBanner}
      />
    </>
  );
}
