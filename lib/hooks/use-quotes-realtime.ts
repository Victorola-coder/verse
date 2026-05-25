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

    const channel = client
      .channel("verse-quotes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quotes" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["quotes"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quote_likes" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["quotes"] });
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [queryClient]);
}
