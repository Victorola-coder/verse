"use client";

import { api } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { QUERY_KEYS, STALE_TIME } from "@/lib/constants";
import type { QuoteDraft, SavedQuoteDraft } from "@/types/quote";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface DraftsResponse {
  drafts: SavedQuoteDraft[];
}

interface DraftResponse {
  draft: SavedQuoteDraft;
}

export function draftToForm(draft: SavedQuoteDraft): QuoteDraft {
  return {
    id: draft.id,
    text: draft.text,
    author: draft.author,
    category: draft.category as QuoteDraft["category"],
    theme: draft.theme,
    alignment: draft.alignment,
    backgroundImage: draft.backgroundImage ?? undefined,
    showQuoteMarks: draft.showQuoteMarks,
    authorCasing: draft.authorCasing,
  };
}

export function useDraftsQuery(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.drafts(),
    queryFn: async () => {
      const { data } = await api.get<DraftsResponse>("/api/drafts");
      return data.drafts;
    },
    enabled,
    staleTime: STALE_TIME.drafts,
  });
}

export function useDraftQuery(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.draft(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<DraftResponse>(`/api/drafts/${id}`);
      return data.draft;
    },
    enabled: !!id,
  });
}

export function useSaveDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: QuoteDraft): Promise<SavedQuoteDraft> => {
      if (draft.id) {
        const { data } = await api.patch<DraftResponse>(
          `/api/drafts/${draft.id}`,
          {
            text: draft.text,
            author: draft.author,
            category: draft.category,
            theme: draft.theme,
            alignment: draft.alignment,
            backgroundImage: draft.backgroundImage ?? null,
            showQuoteMarks: draft.showQuoteMarks,
            authorCasing: draft.authorCasing,
          }
        );
        return data.draft;
      }

      const { data } = await api.post<DraftResponse>("/api/drafts", {
        text: draft.text,
        author: draft.author,
        category: draft.category,
        theme: draft.theme,
        alignment: draft.alignment,
        backgroundImage: draft.backgroundImage ?? null,
        showQuoteMarks: draft.showQuoteMarks,
        authorCasing: draft.authorCasing,
      });
      return data.draft;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drafts() });
    },
  });
}

export function useDeleteDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/drafts/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drafts() });
    },
  });
}

export async function uploadQuoteImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/quote-image", {
    method: "POST",
    body: formData,
    headers: {
      "X-Session-Id": getSessionId(),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : null) ?? `Upload failed (${response.status})`;
    throw new Error(message);
  }

  if (!payload?.url) {
    throw new Error("Upload succeeded but no URL was returned");
  }

  return payload.url as string;
}
