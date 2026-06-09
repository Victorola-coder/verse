"use client";

import Link from "next/link";
import InstallPrompt from "@/components/InstallPrompt";
import { useVerseStore } from "@/lib/store/verse";
import { cn } from "@/utils/cn";

export default function Navbar() {
  const openCreate = useVerseStore((s) => s.openCreate);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-verse-bg/80 backdrop-blur-md border-b border-verse",
        "pt-[env(safe-area-inset-top)]",
        // Respect side safe-area insets in landscape so the nav doesn't
        // crowd the notch / dynamic island.
        "pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
      )}
    >
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between gap-3 sm:gap-4">
        <Link
          href="/"
          aria-label="Verse home"
          className="font-serif text-xl sm:text-2xl text-verse-text tracking-wide shrink-0 transition-opacity duration-300 [@media(hover:hover)]:hover:opacity-70"
        >
          Verse
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <a
            href="/#feed"
            className="hidden sm:inline font-sans text-sm text-verse-muted transition-colors duration-300 [@media(hover:hover)]:hover:text-verse-text"
          >
            Explore
          </a>
          <Link
            href="/saved"
            className="font-sans text-xs sm:text-sm text-verse-muted px-2 py-2 min-h-11 inline-flex items-center transition-colors duration-300 [@media(hover:hover)]:hover:text-verse-text"
          >
            Saved
          </Link>
          <InstallPrompt />
          {/* Hidden on mobile — the bottom-nav center button replaces this. */}
          <button
            type="button"
            onClick={() => openCreate()}
            className={cn(
              "hidden md:inline-flex font-sans text-xs sm:text-sm px-4 sm:px-5 py-2 min-h-11 rounded-full whitespace-nowrap items-center",
              "bg-verse-accent text-verse-bg",
              "transition-all duration-300 ease-verse active:scale-95",
              "[@media(hover:hover)]:hover:opacity-90 [@media(hover:hover)]:hover:-translate-y-0.5"
            )}
          >
            Create Quote
          </button>
        </div>
      </nav>
    </header>
  );
}
