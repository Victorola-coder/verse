"use client";

import { useQuotes } from "@/lib/quote-context";
import { SEED_QUOTES } from "@/lib/quotes-data";
import { cn } from "@/utils/cn";

const heroQuote = SEED_QUOTES.find((q) => q.id === "hero-1") ?? SEED_QUOTES[0];

export default function HeroSection() {
  const { openCreate } = useQuotes();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
          "relative z-10 max-w-4xl mx-auto px-6 text-center",
          "animate-[fadeUp_1.2s_ease-out_forwards] opacity-0"
        )}
      >
        <blockquote className="font-serif font-light text-verse-text leading-[1.35] text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight">
          <span className="block text-verse-muted/50 text-5xl md:text-6xl mb-4 select-none">
            &ldquo;
          </span>
          {heroQuote.text}
        </blockquote>

        <p className="mt-10 font-sans text-sm text-verse-accent tracking-[0.25em] uppercase">
          — {heroQuote.author}
        </p>

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={openCreate}
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
