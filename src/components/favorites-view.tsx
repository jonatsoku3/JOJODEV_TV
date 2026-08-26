"use client";

import { useEffect, useState } from "react";
import { ChannelGrid } from "@/components/channel-grid";
import { EmptyState } from "@/components/empty-state";
import { useLibrary } from "@/hooks/use-library";
import { COPY } from "@/lib/i18n";
import type { ChannelSummary } from "@/lib/types";

export function FavoritesView() {
  const { ready, favoriteIds } = useLibrary();
  const [items, setItems] = useState<ChannelSummary[]>([]);
  const [loadedFor, setLoadedFor] = useState("");
  const idsKey = favoriteIds.join(",");

  useEffect(() => {
    if (!ready || !idsKey) return;
    let cancelled = false;
    fetch(`/api/channels?ids=${idsKey.split(",").map(encodeURIComponent).join(",")}`)
      .then((res) => res.json())
      .then((data: { items: ChannelSummary[] }) => {
        if (!cancelled) {
          setItems(data.items);
          setLoadedFor(idsKey);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setLoadedFor(idsKey);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ready, idsKey]);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;
  }
  if (!favoriteIds.length) {
    return <EmptyState title={COPY.emptyFavorites} body={COPY.emptyFavoritesBody} />;
  }
  if (loadedFor !== idsKey) {
    return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;
  }
  if (!items.length) {
    return <EmptyState title={COPY.emptyFavorites} body={COPY.emptyFavoritesBody} />;
  }
  return <ChannelGrid items={items} />;
}
