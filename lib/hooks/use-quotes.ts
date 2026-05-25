"use client";

import { api } from "@/lib/api";
import { useVerseStore } from "@/lib/store/verse";
import { QUERY_KEYS, STALE_TIME } from "@/lib/constants";
import type { Quote, QuoteCategory, QuoteDraft } from "@/types/quote";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface QuotesResponse {
  quotes: Quote[];
}

interface LikeResponse {
  liked: boolean;
  likes: number;
}

export function useQuotesQuery(category?: QuoteCategory) {
  const activeCategory = useVerseStore((s) => s.activeCategory);
  const searchQuery = useVerseStore((s) => s.searchQuery);
  const sort = useVerseStore((s) => s.sort);
  const cat = category ?? activeCategory;

  return useQuery({
    queryKey: QUERY_KEYS.quotes(cat, sort, searchQuery),
    queryFn: async () => {
      const { data } = await api.get<QuotesResponse>("/api/quotes", {
        params: {
          category: cat,
          sort,
          ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
        },
      });
      return data.quotes;
    },
    staleTime: STALE_TIME.quotes,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
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
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
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

export function useBookmarkedQuotesQuery() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const { data } = await api.get<QuotesResponse>("/api/bookmarks");
      return data.quotes;
    },
    staleTime: STALE_TIME.quotes,
  });
}

export function useToggleBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      const { data } = await api.post<{ bookmarked: boolean }>(
        `/api/quotes/${quoteId}/bookmark`
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
        return old.map((q) =>
          q.id === quoteId ? { ...q, bookmarkedByMe: !q.bookmarkedByMe } : q
        );
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
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
      void queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}
