"use client";

import { useEffect } from "react";
import QueryProvider from "@/components/QueryProvider";
import CreateQuoteModal from "@/components/CreateQuoteModal";
import { useQuotesRealtime } from "@/lib/hooks/use-quotes-realtime";
import { getSessionId } from "@/lib/session";

function SessionInit() {
  useEffect(() => {
    getSessionId();
  }, []);
  return null;
}

function RealtimeListener({ children }: { children: React.ReactNode }) {
  useQuotesRealtime();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionInit />
      <RealtimeListener>{children}</RealtimeListener>
      <CreateQuoteModal />
    </QueryProvider>
  );
}
