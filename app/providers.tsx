"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useQuotesRealtime } from "@/lib/hooks/use-quotes-realtime";
import { getSessionId } from "@/lib/session";
import CreateQuoteModal from "@/components/CreateQuoteModal";

function RealtimeListener({ children }: { children: React.ReactNode }) {
  useQuotesRealtime();
  return <>{children}</>;
}

function SessionInit() {
  useEffect(() => {
    getSessionId();
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionInit />
      <RealtimeListener>
        {children}
        <CreateQuoteModal />
      </RealtimeListener>
    </QueryClientProvider>
  );
}
