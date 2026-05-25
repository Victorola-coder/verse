"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_KEYS, STALE_TIME } from "@/lib/constants";
import { useVerseStore } from "@/lib/store/verse";
import type { Quote, QuoteCategory, QuoteDraft } from "@/types/quote";

interface QuotesResponse {
  quotes: Quote[];
}

interface LikeResponse {
  liked: boolean;
  likes: number;
}

export function useQuotesQuery(category?: QuoteCategory) {
  const activeCategory = useVerseStore((s) => s.activeCategory);
  const cat = category ?? activeCategory;

  return useQuery({
    queryKey: QUERY_KEYS.quotes(cat),
    queryFn: async () => {
      const { data } = await api.get<QuotesResponse>("/api/quotes", {
        params: { category: cat },
      });
      return data.quotes;
    },
    staleTime: STALE_TIME.quotes,
    refetchOnWindowFocus: true,
  });
}

export function useFeaturedQuotesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.featured(),
    queryFn: async () => {
      const { data } = await api.get<QuotesResponse>("/api/quotes", {
        params: { featured: true },
      });
      return data.quotes;
    },
    staleTime: STALE_TIME.quotes,
    refetchOnWindowFocus: true,
  });
}

export function useCreateQuoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: QuoteDraft & { draftId?: string }
    ): Promise<Quote> => {
      const { data } = await api.post<{ quote: Quote }>("/api/quotes", {
        text: payload.text,
        author: payload.author,
        category: payload.category,
        theme: payload.theme,
        alignment: payload.alignment,
        backgroundImage: payload.backgroundImage ?? null,
        showQuoteMarks: payload.showQuoteMarks,
        authorCasing: payload.authorCasing,
        draftId: payload.draftId ?? payload.id,
      });
      return data.quote;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["quotes"] });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drafts() });
    },
  });
}

export function useToggleLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      const { data } = await api.post<LikeResponse>(
        `/api/quotes/${quoteId}/like`
      );
      return { quoteId, ...data };
    },
    onMutate: async (quoteId) => {
      await queryClient.cancelQueries({ queryKey: ["quotes"] });

      const previous = queryClient.getQueriesData<Quote[]>({
        queryKey: ["quotes"],
      });

      queryClient.setQueriesData<Quote[]>({ queryKey: ["quotes"] }, (old) => {
        if (!old) {
          return old;
        }
        return old.map((q) => {
          if (q.id !== quoteId) {
            return q;
          }
          const liked = !q.likedByMe;
          return {
            ...q,
            likedByMe: liked,
            likes: liked ? q.likes + 1 : Math.max(0, q.likes - 1),
          };
        });
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}
