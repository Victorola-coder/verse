"use client";

import { useQuotes } from "@/lib/quote-context";
import { cn } from "@/utils/cn";

export default function Navbar() {
  const { openCreate } = useQuotes();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className={cn(
          "mx-auto max-w-6xl px-6 py-5 flex items-center justify-between",
          "bg-verse-bg/80 backdrop-blur-md verse-border border-x-0 border-t-0"
        )}
      >
        <a
          href="/"
          className="font-serif text-2xl text-verse-text tracking-wide transition-opacity duration-300 hover:opacity-70"
        >
          Verse
        </a>

        <div className="flex items-center gap-6">
          <a
            href="#feed"
            className="hidden sm:inline font-sans text-sm text-verse-muted transition-colors duration-300 hover:text-verse-text"
          >
            Explore
          </a>
          <button
            type="button"
            onClick={openCreate}
            className={cn(
              "font-sans text-sm px-5 py-2 rounded-full",
              "bg-verse-accent text-verse-bg",
              "transition-all duration-300 ease-verse",
              "hover:opacity-90 hover:-translate-y-0.5"
            )}
          >
            Create Quote
          </button>
        </div>
      </nav>
    </header>
  );
}
