"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, Plus } from "lucide-react";
import { useVerseStore } from "@/lib/store/verse";
import { cn } from "@/utils/cn";

interface NavItem {
  href?: string;
  label: string;
  icon: typeof Home;
  match?: (pathname: string) => boolean;
  onClick?: () => void;
  center?: boolean;
}

export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const openCreate = useVerseStore((s) => s.openCreate);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const items: NavItem[] = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      match: (p) => p === "/" || p.startsWith("/q/"),
    },
    {
      label: "Create",
      icon: Plus,
      onClick: () => openCreate(),
      center: true,
    },
    {
      href: "/saved",
      label: "Saved",
      icon: Bookmark,
      match: (p) => p.startsWith("/saved"),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-[90] flex justify-center pointer-events-none md:hidden"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
        paddingLeft: "1rem",
        paddingRight: "1rem",
      }}
    >
      <div
        className={cn(
          "pointer-events-auto",
          "relative flex items-center gap-1.5 px-2 py-2",
          "rounded-full",
          "bg-verse-card/70 backdrop-blur-2xl backdrop-saturate-150",
          "border border-white/10",
          "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        )}
      >
        {items.map((item) => {
          const active = item.href
            ? item.match?.(pathname) ?? pathname === item.href
            : false;

          const Icon = item.icon;
          const content = (
            <>
              <Icon
                className={cn(
                  item.center ? "h-5 w-5" : "h-[18px] w-[18px]",
                  "shrink-0"
                )}
              />
              <span className="sr-only">{item.label}</span>
            </>
          );

          const baseClasses = cn(
            "relative flex items-center justify-center rounded-full",
            "transition-all duration-300 ease-verse",
            "active:scale-95",
            item.center
              ? "h-12 w-12 bg-verse-accent text-verse-bg shadow-[0_4px_18px_-4px_rgba(214,185,140,0.55)] hover:shadow-[0_6px_22px_-4px_rgba(214,185,140,0.7)] hover:-translate-y-0.5"
              : cn(
                  "h-11 w-11",
                  active
                    ? "bg-white/8 text-verse-accent"
                    : "text-verse-muted hover:text-verse-text"
                )
          );

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={baseClasses}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              aria-label={item.label}
              className={baseClasses}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
