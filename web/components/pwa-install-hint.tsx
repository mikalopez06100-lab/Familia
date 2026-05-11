"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "familia-pwa-install-dismissed-at";
const DISMISS_DAYS = 14;
const MANUAL_HINT_MS = 2800;

type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (Number.isNaN(ts)) return false;
    return (Date.now() - ts) / 86_400_000 < DISMISS_DAYS;
  } catch {
    return false;
  }
}

const chromeInstallHelpFr =
  "https://support.google.com/chrome/answer/9658361?hl=fr&co=GENIE.Platform%3DAndroid";

export default function PwaInstallHint() {
  const [visible, setVisible] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEventLike | null>(null);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!isAndroid() || isStandalone() || wasDismissedRecently()) return;

    let cancelled = false;

    const onBeforeInstallPrompt = (e: Event) => {
      const ev = e as BeforeInstallPromptEventLike;
      ev.preventDefault();
      deferredRef.current = ev;
      if (!cancelled) {
        setCanPrompt(true);
        setVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => null);
    }

    const timer = window.setTimeout(() => {
      if (!cancelled && !deferredRef.current && !wasDismissedRecently()) {
        setVisible(true);
      }
    }, MANUAL_HINT_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.clearTimeout(timer);
    };
  }, []);

  const onInstallClick = async () => {
    const ev = deferredRef.current;
    if (!ev) return;
    try {
      await ev.prompt();
      const { outcome } = await ev.userChoice;
      deferredRef.current = null;
      setCanPrompt(false);
      if (outcome === "accepted") setVisible(false);
    } catch {
      /* ignore */
    }
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Installation de l’application"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-violet-200 bg-white/95 px-3 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-sm text-slate-800">
          {canPrompt ? (
            <>
              <p className="font-semibold">Installer l’app sur cet appareil</p>
              <p className="mt-0.5 text-slate-600">Accès plus rapide depuis l’écran d’accueil, comme une app classique.</p>
            </>
          ) : (
            <>
              <p className="font-semibold">Raccourci sur l’écran d’accueil</p>
              <p className="mt-0.5 text-slate-600">
                Dans Chrome : menu <span className="whitespace-nowrap font-mono text-xs">⋮</span> puis «&nbsp;Installer
                l&apos;application&nbsp;» ou «&nbsp;Ajouter à l&apos;écran d&apos;accueil&nbsp;».
              </p>
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canPrompt ? (
            <button
              type="button"
              onClick={() => void onInstallClick()}
              className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              Installer
            </button>
          ) : (
            <a
              href={chromeInstallHelpFr}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-900"
            >
              Aide Chrome
            </a>
          )}
          <button type="button" onClick={dismiss} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-slate-700">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
