"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const DISMISS_DAYS = 14;
const MANUAL_HINT_MS = 2800;

type HintConfig = {
  storageKey: string;
  titlePrompt: string;
  subtitlePrompt: string;
  titleManual: string;
  subtitleManual: string;
};

const HINT_CONFIGS: Record<string, HintConfig> = {
  parent: {
    storageKey: "familia-pwa-install-dismissed-at",
    titlePrompt: "Installer l’app sur cet appareil",
    subtitlePrompt: "Accès plus rapide depuis l’écran d’accueil, comme une app classique.",
    titleManual: "Raccourci sur l’écran d’accueil",
    subtitleManual:
      "Dans Chrome : menu ⋮ puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».",
  },
  lisandro: {
    storageKey: "lisandro-pwa-install-dismissed-at",
    titlePrompt: "Installer mon app sur ce téléphone",
    subtitlePrompt: "Voir tes points et ta routine directement depuis l’écran d’accueil.",
    titleManual: "Ajouter à l’écran d’accueil",
    subtitleManual:
      "Dans Chrome : menu ⋮ puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».",
  },
};

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

function wasDismissedRecently(storageKey: string): boolean {
  try {
    const raw = localStorage.getItem(storageKey);
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
  const pathname = usePathname();
  const variant = pathname?.startsWith("/lisandro") ? "lisandro" : "parent";
  const config = HINT_CONFIGS[variant];

  const [visible, setVisible] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [installHint, setInstallHint] = useState<string | null>(null);
  const deferredRef = useRef<BeforeInstallPromptEventLike | null>(null);
  const installBusyRef = useRef(false);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(config.storageKey, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, [config.storageKey]);

  useEffect(() => {
    if (!isAndroid() || isStandalone() || wasDismissedRecently(config.storageKey)) return;

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
      if (!cancelled && !deferredRef.current && !wasDismissedRecently(config.storageKey)) {
        setVisible(true);
      }
    }, MANUAL_HINT_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.clearTimeout(timer);
    };
  }, [config.storageKey]);

  /**
   * Pattern MDN / Chrome : enregistrer `userChoice` puis appeler `prompt()` dans le même tour
   * synchrone que le clic (pas de `async` sur le handler).
   */
  const onInstallClick = () => {
    setInstallHint(null);
    const ev = deferredRef.current;
    if (!ev || installBusyRef.current) return;
    installBusyRef.current = true;

    void Promise.resolve(ev.prompt()).catch(() => {
      installBusyRef.current = false;
      deferredRef.current = null;
      setCanPrompt(false);
      setInstallHint(
        "Chrome n’a pas pu ouvrir l’installation depuis ce bouton. Menu ⋮ → « Installer l’application » ou « Ajouter à l’écran d’accueil ».",
      );
    });

    void ev.userChoice
      .then((choice) => {
        installBusyRef.current = false;
        deferredRef.current = null;
        setCanPrompt(false);
        if (choice.outcome === "accepted") {
          setVisible(false);
          return;
        }
        setInstallHint(
          "Installation annulée. Réessaie plus tard ou menu ⋮ → « Installer l’application ».",
        );
      })
      .catch(() => {
        installBusyRef.current = false;
      });
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
              <p className="font-semibold">{config.titlePrompt}</p>
              <p className="mt-0.5 text-slate-600">{config.subtitlePrompt}</p>
              {installHint && <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-950">{installHint}</p>}
            </>
          ) : (
            <>
              <p className="font-semibold">{config.titleManual}</p>
              <p className="mt-0.5 text-slate-600">
                {variant === "parent" ? (
                  <>
                    Dans Chrome : menu <span className="whitespace-nowrap font-mono text-xs">⋮</span> puis «&nbsp;Installer
                    l&apos;application&nbsp;» ou «&nbsp;Ajouter à l&apos;écran d&apos;accueil&nbsp;».
                  </>
                ) : (
                  config.subtitleManual
                )}
              </p>
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canPrompt ? (
            <button type="button" onClick={onInstallClick} className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-sm">
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
