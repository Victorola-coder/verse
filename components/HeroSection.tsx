"use client";

import {
  useQuotesQuery,
  useDailyQuoteQuery,
  useFeaturedQuotesQuery,
} from "@/lib/hooks/use-quotes";
import { cn } from "@/utils/cn";
import { ArrowDown, PenLine } from "lucide-react";
import { useVerseStore } from "@/lib/store/verse";

import { useEffect, useMemo, useState } from "react";
import { formatAuthorAttribution } from "@/utils/format-author";

const FALLBACK_HERO = {
  text: "Music no need permission to enter your spirit.",
  author: "Mohbad",
  authorCasing: "as-typed" as const,
};

const ROTATE_INTERVAL_MS = 9000;

export default function HeroSection() {
  const openCreate = useVerseStore((s) => s.openCreate);
  const { data: daily } = useDailyQuoteQuery();
  const { data: featured = [] } = useFeaturedQuotesQuery();
  const { data: allQuotes = [] } = useQuotesQuery("all");
  const [rotateKey, setRotateKey] = useState(0);

  const pool = useMemo(() => {
    if (featured.length > 0) {
      return featured;
    }
    return allQuotes;
  }, [featured, allQuotes]);

  // Auto-rotate the hero quote every ~9s, paused when tab is hidden
  // or the user has prefers-reduced-motion enabled.
  useEffect(() => {
    if (pool.length <= 1) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      return;
    }

    let timer: number | null = null;

    const tick = () => {
      if (document.visibilityState === "visible") {
        setRotateKey((k) => k + 1);
      }
    };

    const start = () => {
      stop();
      timer = window.setInterval(tick, ROTATE_INTERVAL_MS);
    };
    const stop = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pool.length]);

  const hero = useMemo(() => {
    if (rotateKey === 0 && daily?.quote) {
      return daily.quote;
    }
    if (pool.length === 0) {
      return FALLBACK_HERO;
    }
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }, [pool, rotateKey, daily]);

  const heroAuthor = formatAuthorAttribution(
    hero.author,
    hero.authorCasing
  );
  const showDailyBadge = rotateKey === 0 && !!daily?.quote;

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-20 pb-12">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(214, 185, 140, 0.12) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 verse-grain" />

      <div
        className={cn(
          "relative z-10 max-w-4xl mx-auto text-center w-full",
          "animate-[fadeUp_1.2s_ease-out_forwards] opacity-0"
        )}
      >
        {showDailyBadge && daily?.dayIndex != null && (
          <p className="font-sans text-[10px] text-verse-accent tracking-[0.35em] uppercase mb-6">
            · Day {daily.dayIndex + 1} ·
          </p>
        )}

        <blockquote
          key={hero.text}
          className="font-serif font-light text-verse-text leading-[1.35] text-[clamp(1.75rem,6vw,4.5rem)] tracking-tight animate-[fadeUp_0.6s_ease-out_forwards]"
        >
          <span className="block text-verse-muted/50 text-5xl md:text-6xl mb-4 select-none">
            &ldquo;
          </span>
          {hero.text}
        </blockquote>

        {heroAuthor && (
          <p
            key={`${hero.text}-author`}
            className="mt-10 font-sans text-sm text-verse-accent tracking-[0.25em] uppercase animate-[fadeUp_0.6s_ease-out_forwards]"
          >
            — {heroAuthor}
          </p>
        )}

        <div className="mt-12 sm:mt-14 flex flex-row items-center justify-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={() => openCreate()}
            className={cn(
              "group relative inline-flex items-center justify-center gap-2 sm:gap-2.5",
              "font-sans text-sm sm:text-base font-medium",
              "px-5 sm:pl-6 sm:pr-7 py-3.5 sm:py-4 rounded-full",
              "bg-verse-accent text-verse-bg",
              "shadow-[0_10px_30px_-10px_rgba(214,185,140,0.55)]",
              "transition-all duration-300 ease-verse",
              "[@media(hover:hover)]:hover:shadow-[0_14px_36px_-10px_rgba(214,185,140,0.75)]",
              "[@media(hover:hover)]:hover:-translate-y-0.5",
              "active:scale-[0.98]"
            )}
          >
            <PenLine className="h-4 w-4" />
            <span>Write a quote</span>
          </button>
          <a
            href="#feed"
            className={cn(
              "group inline-flex items-center justify-center gap-2",
              "font-sans text-sm sm:text-base",
              "px-5 sm:px-6 py-3.5 sm:py-4 rounded-full",
              "text-verse-text/90",
              "bg-white/[0.03] backdrop-blur-sm",
              "border border-white/10",
              "transition-all duration-300 ease-verse",
              "[@media(hover:hover)]:hover:bg-white/[0.06] [@media(hover:hover)]:hover:border-white/20 [@media(hover:hover)]:hover:-translate-y-0.5"
            )}
          >
            <span>Browse</span>
            <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
