"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

// In-app splash overlay. Mounted in the root layout, runs on every fresh
// page-load (not on client-side navigations). Acts as a guaranteed-visible
// brand moment because the native iOS PWA splash often flashes too fast to
// register. Suppressed for ~30 s after showing so iterating-on-localhost
// reloads don't get repeated splashes.

const VISIBLE_MS = 900;
const FADE_MS = 450;
const SUPPRESS_KEY = "verse_splash_seen_at";
const SUPPRESS_TTL_MS = 30 * 1000;

export default function SplashOverlay() {
  const [mounted, setMounted] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    let suppress = false;
    try {
      const last = Number(window.sessionStorage.getItem(SUPPRESS_KEY) ?? 0);
      if (last && Date.now() - last < SUPPRESS_TTL_MS) {
        suppress = true;
      } else {
        window.sessionStorage.setItem(SUPPRESS_KEY, String(Date.now()));
      }
    } catch {
      /* sessionStorage blocked — just show the splash */
    }

    if (suppress) {
      setMounted(false);
      return;
    }

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const visibleMs = reduced ? 300 : VISIBLE_MS;
    const fadeMs = reduced ? 0 : FADE_MS;

    const fadeTimer = window.setTimeout(() => setFadingOut(true), visibleMs);
    const unmountTimer = window.setTimeout(
      () => setMounted(false),
      visibleMs + fadeMs
    );

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center",
        "bg-verse-bg",
        "transition-opacity duration-[450ms] ease-out",
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="absolute inset-0 verse-grain opacity-60" />
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(214,185,140,0.10) 0%, transparent 65%)",
        }}
      />

      <div className="relative flex flex-col items-center animate-[fadeUp_0.6s_ease-out_forwards] opacity-0">
        <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-verse-card verse-border">
          <span
            className="font-serif italic text-verse-text leading-none"
            style={{ fontSize: "3.25rem", paddingBottom: "0.35rem" }}
          >
            V
          </span>
          <span className="absolute bottom-[18%] h-[2px] w-7 sm:w-8 bg-verse-accent rounded-full" />
        </div>
        <p className="mt-6 font-sans text-[11px] tracking-[0.45em] uppercase text-verse-muted">
          Verse
        </p>
      </div>
    </div>
  );
}
