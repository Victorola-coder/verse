"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
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
      <Toaster
        position="top-center"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "#161616",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#F5F1EA",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          },
        }}
      />
    </QueryProvider>
  );
}
