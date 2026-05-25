"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function useQuotesRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const client = supabase;
    if (!client) {
      return;
    }

    let pending: ReturnType<typeof setTimeout> | null = null;
    const scheduleInvalidate = () => {
      if (pending) {
        return;
      }
      pending = setTimeout(() => {
        pending = null;
        void queryClient.invalidateQueries({ queryKey: ["quotes"] });
      }, 800);
    };

    const channel = client
      .channel("verse-quotes-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "quotes" },
        scheduleInvalidate
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "quotes" },
        scheduleInvalidate
      )
      .subscribe();

    return () => {
      if (pending) {
        clearTimeout(pending);
      }
      void client.removeChannel(channel);
    };
  }, [queryClient]);
}
