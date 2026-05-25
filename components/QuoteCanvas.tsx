"use client";

import { forwardRef } from "react";
import { THEME_STYLES } from "@/lib/themes";
import type { QuoteAlignment, QuoteTheme } from "@/types/quote";
import { cn } from "@/utils/cn";

export interface QuoteCanvasProps {
  text: string;
  author: string;
  theme: QuoteTheme;
  alignment?: QuoteAlignment;
  backgroundImage?: string;
  className?: string;
  exportMode?: boolean;
}

const alignmentClasses: Record<QuoteAlignment, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const QuoteCanvas = forwardRef<HTMLDivElement, QuoteCanvasProps>(
  function QuoteCanvas(
    {
      text,
      author,
      theme,
      alignment = "center",
      backgroundImage,
      className,
      exportMode = false,
    },
    ref
  ) {
    const styles = THEME_STYLES[theme];
    const displayText = text.trim() || "Your words belong here.";
    const displayAuthor = author.trim() ? `— ${author.trim()}` : "";

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden flex flex-col justify-center",
          exportMode
            ? "w-[1080px] h-[1350px] p-24"
            : "w-full aspect-[4/5] p-10 md:p-14",
          className
        )}
        style={{
          background: styles.background,
          color: styles.text,
        }}
      >
        {backgroundImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImage}
              alt=""
              crossOrigin="anonymous"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: styles.overlay }}
            />
          </>
        )}

        <div className="absolute inset-0 verse-grain pointer-events-none opacity-60" />

        <div
          className={cn(
            "relative z-10 flex flex-col gap-8 w-full max-w-2xl mx-auto",
            alignmentClasses[alignment]
          )}
        >
          <blockquote
            className={cn(
              "font-serif font-light leading-[1.35] tracking-tight",
              exportMode ? "text-[72px]" : "text-3xl md:text-4xl lg:text-5xl"
            )}
            style={{ color: styles.text }}
          >
            <span className="opacity-40 mr-1">&ldquo;</span>
            {displayText}
            <span className="opacity-40 ml-1">&rdquo;</span>
          </blockquote>

          {displayAuthor && (
            <p
              className={cn(
                "font-sans tracking-[0.2em] uppercase",
                exportMode ? "text-2xl" : "text-xs md:text-sm"
              )}
              style={{ color: styles.accent }}
            >
              {displayAuthor}
            </p>
          )}
        </div>

        <p
          className={cn(
            "absolute bottom-8 left-0 right-0 text-center font-sans tracking-[0.35em] uppercase opacity-30",
            exportMode ? "text-xl" : "text-[10px]"
          )}
          style={{ color: styles.muted }}
        >
          verse
        </p>
      </div>
    );
  }
);

export default QuoteCanvas;
