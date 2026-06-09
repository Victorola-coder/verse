"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useVerseStore } from "@/lib/store/verse";
import { cn } from "@/utils/cn";

// Pull distance (in CSS pixels of finger travel) needed to commit a refresh.
// The actual visual pull is dampened by the resistance curve below.
const COMMIT_THRESHOLD = 70;
// Visual cap on how far the indicator can be dragged.
const MAX_VISUAL_PULL = 110;
// Dampening factor — finger moves 1px, indicator moves this much.
const RESISTANCE = 0.5;
// Minimum perceived refresh duration so it doesn't blink.
const MIN_SPIN_MS = 600;

export default function PullToRefresh() {
  const queryClient = useQueryClient();
  const pathname = usePathname() ?? "/";
  const isCreateOpen = useVerseStore((s) => s.isCreateOpen);

  // Mirror state in refs so the touchend handler reads the latest values
  // (closures over state would be stale by the time touchend fires).
  const pullRef = useRef(0);
  const trackingRef = useRef(false);
  const startYRef = useRef(0);
  const refreshingRef = useRef(false);
  const pathnameRef = useRef(pathname);
  const modalOpenRef = useRef(isCreateOpen);

  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    modalOpenRef.current = isCreateOpen;
  }, [isCreateOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    // Skip on coarse devices that already give us a native PTR via browser
    // chrome — only kicks in for installed PWA mode where that's gone, plus
    // a guard for desktop (no touch).
    const isTouch = window.matchMedia?.("(pointer: coarse)").matches;
    if (!isTouch) {
      return;
    }

    const runRefresh = async () => {
      refreshingRef.current = true;
      setRefreshing(true);
      setPull(COMMIT_THRESHOLD);
      pullRef.current = COMMIT_THRESHOLD;

      const started = performance.now();
      try {
        const tasks: Promise<unknown>[] = [];
        const path = pathnameRef.current;
        if (path.startsWith("/saved")) {
          tasks.push(
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
          );
        } else if (path.startsWith("/q/")) {
          tasks.push(queryClient.invalidateQueries({ queryKey: ["quotes"] }));
        } else {
          tasks.push(queryClient.invalidateQueries({ queryKey: ["quotes"] }));
          tasks.push(
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
          );
        }
        await Promise.all(tasks);
        const elapsed = performance.now() - started;
        if (elapsed < MIN_SPIN_MS) {
          await new Promise((r) => setTimeout(r, MIN_SPIN_MS - elapsed));
        }
      } finally {
        refreshingRef.current = false;
        setRefreshing(false);
        setPull(0);
        pullRef.current = 0;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current || modalOpenRef.current) {
        return;
      }
      if (window.scrollY > 0) {
        trackingRef.current = false;
        return;
      }
      // Don't hijack horizontal swipes inside scroll containers
      if (e.touches.length !== 1) {
        return;
      }
      startYRef.current = e.touches[0].clientY;
      trackingRef.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!trackingRef.current || refreshingRef.current) {
        return;
      }
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy <= 0) {
        if (pullRef.current !== 0) {
          pullRef.current = 0;
          setPull(0);
        }
        return;
      }
      // If user has scrolled down somehow (rubber band reset), stop tracking
      if (window.scrollY > 0) {
        trackingRef.current = false;
        pullRef.current = 0;
        setPull(0);
        return;
      }
      const distance = Math.min(MAX_VISUAL_PULL, dy * RESISTANCE);
      pullRef.current = distance;
      setPull(distance);
      if (distance > 8 && e.cancelable) {
        // Suppress iOS rubber-band while we're actively pulling
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      if (!trackingRef.current) {
        return;
      }
      trackingRef.current = false;
      if (pullRef.current >= COMMIT_THRESHOLD && !refreshingRef.current) {
        void runRefresh();
      } else {
        pullRef.current = 0;
        setPull(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [queryClient]);

  const visible = pull > 0 || refreshing;
  // 0..1 progress toward commit threshold
  const progress = Math.min(1, pull / COMMIT_THRESHOLD);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 top-0 z-[95] flex justify-center pointer-events-none",
        "transition-opacity duration-150",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.5rem)",
        transform: `translateY(${Math.max(0, pull - 24)}px)`,
        transition: trackingRef.current
          ? "none"
          : "transform 220ms ease-out, opacity 200ms ease-out",
      }}
    >
      <div
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full",
          "bg-verse-card/85 backdrop-blur-xl border border-white/10",
          "shadow-[0_4px_18px_-4px_rgba(0,0,0,0.5)]"
        )}
        style={{
          // Spin freely while refreshing; otherwise rotate proportional to pull
          transform: refreshing ? undefined : `rotate(${progress * 270}deg)`,
          transition: refreshing ? undefined : "transform 80ms linear",
        }}
      >
        <RefreshCw
          className={cn(
            "h-4 w-4 text-verse-accent",
            refreshing && "animate-spin"
          )}
        />
      </div>
    </div>
  );
}
