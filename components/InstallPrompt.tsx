"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const DISMISSED_KEY = "verse_install_dismissed_at";
const DISMISSAL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isInStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function recentlyDismissed() {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const at = window.localStorage.getItem(DISMISSED_KEY);
    if (!at) {
      return false;
    }
    return Date.now() - Number(at) < DISMISSAL_TTL_MS;
  } catch {
    return false;
  }
}

export default function InstallPrompt({ className }: { className?: string }) {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) {
      setInstalled(true);
      return;
    }
    if (recentlyDismissed()) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => {
      setInstalled(true);
      setEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!event) {
      return;
    }
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === "accepted") {
        toast.success("Verse installed");
        setInstalled(true);
      } else {
        try {
          window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
      }
      setEvent(null);
    } catch {
      toast.error("Could not start install");
    }
  }, [event]);

  if (installed || !event) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      aria-label="Install Verse"
      className={cn(
        "inline-flex items-center gap-1.5 font-sans text-xs sm:text-sm",
        "px-3 sm:px-4 py-2 rounded-full verse-border text-verse-text",
        "transition-all duration-300 ease-verse",
        "hover:border-verse-accent/40 hover:text-verse-accent hover:-translate-y-0.5",
        className
      )}
    >
      <Download className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Install</span>
      <span className="sm:hidden">App</span>
    </button>
  );
}
