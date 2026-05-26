"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { cn } from "@/utils/cn";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/quotes", label: "Quotes", icon: MessageSquareQuote },
];

function isLoginRoute(pathname: string | null) {
  return pathname === "/admin/login";
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (isLoginRoute(pathname)) {
    return (
      <>
        {children}
        <Toaster position="top-center" theme="dark" richColors />
      </>
    );
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-verse-bg">
      <aside
        className={cn(
          "lg:w-60 lg:shrink-0 lg:min-h-[100dvh]",
          "border-b lg:border-b-0 lg:border-r border-verse",
          "bg-verse-card/40 backdrop-blur-sm",
          "flex lg:flex-col items-center lg:items-stretch",
          "px-4 py-3 lg:py-6 gap-2 lg:gap-1"
        )}
      >
        <Link
          href="/admin"
          className="font-serif text-xl text-verse-text px-2 py-2 hidden lg:block"
        >
          Verse · Admin
        </Link>
        <Link
          href="/admin"
          className="font-serif text-base text-verse-text lg:hidden mr-auto"
        >
          Verse · Admin
        </Link>

        <nav className="flex lg:flex-col items-center lg:items-stretch gap-1 lg:mt-4">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href !== "/admin" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg",
                  "font-sans text-sm transition-colors",
                  active
                    ? "bg-verse-accent/15 text-verse-accent"
                    : "text-verse-muted hover:text-verse-text hover:bg-verse-card"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="lg:mt-auto ml-auto lg:ml-0 flex items-center gap-2">
          <Link
            href="/"
            className="font-sans text-xs text-verse-muted hover:text-verse-text px-3 py-2 rounded-lg transition-colors"
          >
            ← Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              "font-sans text-xs text-verse-muted hover:text-verse-accent transition-colors",
              "disabled:opacity-40"
            )}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">{children}</div>

      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
}
