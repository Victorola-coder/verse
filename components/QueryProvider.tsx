"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { GC_TIME, STALE_TIME } from "@/lib/constants";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            // Don't auto-refetch just because a component mounted — if the
            // cache is still fresh (within staleTime) reuse it.
            refetchOnMount: false,
            staleTime: STALE_TIME.quotes,
            gcTime: GC_TIME,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
