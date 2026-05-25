import { toPng } from "html-to-image";

const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1350;
const PIXEL_RATIO = 3;

export interface ExportImageOptions {
  filename?: string;
}

export async function generateQuoteImage(
  element: HTMLElement
): Promise<Blob> {
  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: PIXEL_RATIO,
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    });

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("Failed to generate image");
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
): Promise<boolean> {
  try {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    const file = new File([blob], filename, { type: "image/png" });
    const shareData: ShareData = {
      files: [file],
      title: "Verse",
      text: "A quote from Verse",
    };

    if (!navigator.canShare(shareData)) {
      return false;
    }

    await navigator.share(shareData);
    return true;
  } catch {
    return false;
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
): Promise<"shared" | "downloaded"> {
  const filename = options?.filename ?? `verse-quote-${Date.now()}.png`;
  const blob = await generateQuoteImage(element);

  const shared = await shareQuoteImage(blob, filename);
  if (shared) {
    return "shared";
  }

  downloadBlob(blob, filename);
  return "downloaded";
}
