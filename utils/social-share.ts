import type { QuoteCanvasProps } from "@/components/QuoteCanvas";
import { formatAuthorName } from "@/utils/format-author";

export function buildShareCaption(props: QuoteCanvasProps): string {
  const marks = props.showQuoteMarks ?? true;
  const quote = marks ? `“${props.text.trim()}”` : props.text.trim();
  const author = formatAuthorName(props.author, props.authorCasing ?? "as-typed");

  if (author) {
    return `${quote}\n\n— ${author}\n\nvia Verse`;
  }

  return `${quote}\n\nvia Verse`;
}

export interface SocialShareLink {
  id: string;
  label: string;
  href?: string;
  action?: "copy" | "download" | "native";
  hint?: string;
}

export function getSocialShareLinks(
  caption: string,
  siteUrl?: string
): SocialShareLink[] {
  const encoded = encodeURIComponent(caption);
  const url = encodeURIComponent(siteUrl ?? (typeof window !== "undefined" ? window.location.origin : ""));

  return [
    {
      id: "x",
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${encoded}`,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encoded}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?quote=${encoded}&u=${url}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      hint: "Share your site link; paste caption in the post",
    },
    {
      id: "copy",
      label: "Copy caption",
      action: "copy",
      hint: "Paste with your downloaded image on Instagram or TikTok",
    },
    {
      id: "instagram",
      label: "Instagram / TikTok",
      action: "download",
      hint: "Download image, then upload in the app",
    },
    {
      id: "native",
      label: "More options",
      action: "native",
      hint: "System share sheet (mobile)",
    },
  ];
}
