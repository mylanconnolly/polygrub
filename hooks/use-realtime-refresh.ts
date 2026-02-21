"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type EventType = "INSERT" | "UPDATE" | "DELETE" | "*";

type Subscription = {
  table: string;
  event?: EventType;
  filter?: string;
};

export function useRealtimeRefresh(
  channel: string,
  subscriptions: Subscription[],
) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const key = JSON.stringify(subscriptions);

  useEffect(() => {
    const subs: Subscription[] = JSON.parse(key);
    const supabase = createClient();
    let ch = supabase.channel(channel);

    for (const sub of subs) {
      ch = ch.on(
        "postgres_changes" as const,
        {
          event: sub.event ?? "*",
          schema: "public",
          table: sub.table,
          filter: sub.filter,
        },
        () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => router.refresh(), 300);
        },
      );
    }

    ch.subscribe();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      supabase.removeChannel(ch);
    };
  }, [channel, key, router]);
}
