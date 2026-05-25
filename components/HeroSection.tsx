"use client";

import { useVerseStore } from "@/lib/store/verse";
import { cn } from "@/utils/cn";

const HERO_TEXT = "Music no need permission to enter your spirit.";
const HERO_AUTHOR = "Mohbad";

export default function HeroSection() {
  const openCreate = useVerseStore((s) => s.openCreate);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-20 pb-12">
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
        <blockquote className="font-serif font-light text-verse-text leading-[1.35] text-[clamp(1.75rem,6vw,4.5rem)] tracking-tight">
          <span className="block text-verse-muted/50 text-5xl md:text-6xl mb-4 select-none">
            &ldquo;
          </span>
          {HERO_TEXT}
        </blockquote>

        <p className="mt-10 font-sans text-sm text-verse-accent tracking-[0.25em] uppercase">
          — {HERO_AUTHOR}
        </p>

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => openCreate()}
            className={cn(
              "w-full sm:w-auto font-sans text-sm px-8 py-3.5 rounded-full",
              "bg-verse-accent text-verse-bg",
              "transition-all duration-300 ease-verse",
              "hover:opacity-90 hover:-translate-y-0.5"
            )}
          >
            Create Quote
          </button>
          <a
            href="#feed"
            className={cn(
              "w-full sm:w-auto font-sans text-sm px-8 py-3.5 rounded-full",
              "verse-border text-verse-text",
              "transition-all duration-300 ease-verse",
              "hover:border-verse-accent/40 hover:text-verse-accent hover:-translate-y-0.5"
            )}
          >
            Explore
          </a>
        </div>
      </div>
    </section>
  );
}
