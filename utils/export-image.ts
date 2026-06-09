import { toPng } from "html-to-image";

const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1350;
const PIXEL_RATIO = 2;

export interface ExportImageOptions {
  filename?: string;
}

export type ShareResult = "shared" | "downloaded" | "cancelled" | "opened";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOSUA = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ identifies as Mac
  const isIPadOS =
    ua.includes("Mac") && typeof document !== "undefined" && "ontouchend" in document;
  return isIOSUA || isIPadOS;
}

function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function canShareFiles(file: File): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

async function waitForFonts(): Promise<void> {
  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  } catch {
    // continue without blocking
  }
}

async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
}

function proxyImageUrl(url: string): string {
  if (!url.startsWith("http")) {
    return url;
  }
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export async function prepareExportElement(
  element: HTMLElement
): Promise<() => void> {
  const images = Array.from(element.querySelectorAll("img"));
  const restores: Array<() => void> = [];

  for (const img of images) {
    const original = img.src;
    if (original.startsWith("http")) {
      img.crossOrigin = "anonymous";
      img.src = proxyImageUrl(original);
      restores.push(() => {
        img.src = original;
      });
    }
  }

  await waitForFonts();
  await waitForImages(element);

  // Two animation frames + a microtask tick — gives the browser a chance to
  // both lay out and paint the cloned subtree before html-to-image rasterises.
  // Without this, slower devices (older iPhones, low-end Android) sometimes
  // capture a half-painted canvas that renders "stacked" or blank.
  await new Promise((resolve) =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => resolve(undefined))
    )
  );

  return () => {
    restores.forEach((restore) => restore());
  };
}

export async function generateQuoteImage(
  element: HTMLElement
): Promise<Blob> {
  const restore = await prepareExportElement(element);

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: PIXEL_RATIO,
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
      canvasWidth: EXPORT_WIDTH * PIXEL_RATIO,
      canvasHeight: EXPORT_HEIGHT * PIXEL_RATIO,
      skipFonts: false,
    });

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("Failed to generate image");
  } finally {
    restore();
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Defer revoke so the browser actually has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Open the blob in a new tab — fallback for iOS where neither <a download>
// nor the share sheet are usable. The user can then long-press to save.
export function openBlobInNewTab(blob: Blob): boolean {
  if (typeof window === "undefined") return false;
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return !!win;
}

export async function shareQuoteImage(
  blob: Blob,
  filename: string
): Promise<"shared" | "cancelled" | "unsupported"> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return "unsupported";
  }

  const file = new File([blob], filename, { type: "image/png" });
  if (!canShareFiles(file)) {
    return "unsupported";
  }

  const shareData: ShareData = {
    files: [file],
    title: "Verse",
    text: "A quote from Verse",
  };

  try {
    await navigator.share(shareData);
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    return "unsupported";
  }
}

// Best-effort "save to device" that picks the right mechanism per platform:
//   - iOS (Safari or installed PWA): share sheet ("Save Image" / "Save to Files")
//     because <a download> is unreliable / silent there.
//   - Desktop & Android Chrome: <a download> link.
//   - If everything fails: open in a new tab so the user can long-press save.
export async function saveQuoteImage(
  blob: Blob,
  filename: string
): Promise<ShareResult> {
  const file = new File([blob], filename, { type: "image/png" });

  if (isIOS() && canShareFiles(file)) {
    try {
      await navigator.share({ files: [file], title: "Verse quote" });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      // fall through to download / open
    }
  }

  // In an installed PWA on iOS the link trick still won't write a file —
  // skip straight to opening so the user can long-press save.
  if (isIOS() && isStandalonePWA()) {
    if (openBlobInNewTab(blob)) {
      return "opened";
    }
  }

  try {
    downloadBlob(blob, filename);
    return "downloaded";
  } catch {
    if (openBlobInNewTab(blob)) {
      return "opened";
    }
    throw new Error("Could not save image");
  }
}

export async function exportAndDownloadQuote(
  element: HTMLElement,
  options?: ExportImageOptions
): Promise<ShareResult> {
  const filename = options?.filename ?? `verse-quote-${Date.now()}.png`;
  const blob = await generateQuoteImage(element);
  return saveQuoteImage(blob, filename);
}

export async function exportAndShareQuote(
  element: HTMLElement,
  options?: ExportImageOptions
): Promise<ShareResult> {
  const filename = options?.filename ?? `verse-quote-${Date.now()}.png`;
  const blob = await generateQuoteImage(element);

  const shareResult = await shareQuoteImage(blob, filename);

  if (shareResult === "shared") {
    return "shared";
  }

  if (shareResult === "cancelled") {
    return "cancelled";
  }

  downloadBlob(blob, filename);
  return "downloaded";
}
