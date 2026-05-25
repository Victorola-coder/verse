"use client";

import Link from "next/link";
import { useVerseStore } from "@/lib/store/verse";
import { cn } from "@/utils/cn";

export default function Navbar() {
  const openCreate = useVerseStore((s) => s.openCreate);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className={cn(
          "mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4",
          "bg-verse-bg/80 backdrop-blur-md border-b border-verse",
          "pt-[max(1rem,env(safe-area-inset-top))]"
        )}
      >
        <Link
          href="/"
          className="font-serif text-xl sm:text-2xl text-verse-text tracking-wide shrink-0 transition-opacity duration-300 hover:opacity-70"
        >
          Verse
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="/#feed"
            className="hidden sm:inline font-sans text-sm text-verse-muted transition-colors duration-300 hover:text-verse-text"
          >
            Explore
          </a>
          <Link
            href="/saved"
            className="font-sans text-xs sm:text-sm text-verse-muted transition-colors duration-300 hover:text-verse-text"
          >
            Saved
          </Link>
          <button
            type="button"
            onClick={() => openCreate()}
            className={cn(
              "font-sans text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full whitespace-nowrap",
              "bg-verse-accent text-verse-bg",
              "transition-all duration-300 ease-verse",
              "hover:opacity-90 hover:-translate-y-0.5"
            )}
          >
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">Create Quote</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
