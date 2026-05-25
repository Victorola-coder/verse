import { toPng } from "html-to-image";

const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1350;
const PIXEL_RATIO = 2;

export interface ExportImageOptions {
  filename?: string;
}

export type ShareResult = "shared" | "downloaded" | "cancelled";

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

  // Allow layout/paint after src swap
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

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
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function shareQuoteImage(
  blob: Blob,
  filename: string
): Promise<"shared" | "cancelled" | "unsupported"> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return "unsupported";
  }

  const file = new File([blob], filename, { type: "image/png" });
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

export async function exportAndDownloadQuote(
  element: HTMLElement,
  options?: ExportImageOptions
): Promise<void> {
  const filename = options?.filename ?? `verse-quote-${Date.now()}.png`;
  const blob = await generateQuoteImage(element);
  downloadBlob(blob, filename);
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
