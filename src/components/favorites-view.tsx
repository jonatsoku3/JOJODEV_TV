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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready || favoriteIds.length === 0) {
      return;
    }
    let cancelled = false;
    fetch(`/api/channels?ids=${favoriteIds.map(encodeURIComponent).join(",")}`)
      .then((res) => res.json())
      .then((data: { items: ChannelSummary[] }) => {
        if (!cancelled) {
          setItems(data.items);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ready, favoriteIds]);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;
  }
  if (!favoriteIds.length) {
    return <EmptyState title={COPY.emptyFavorites} body={COPY.emptyFavoritesBody} />;
  }
  if (!loaded) {
    return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;
  }
  if (!items.length) {
    return <EmptyState title={COPY.emptyFavorites} body={COPY.emptyFavoritesBody} />;
  }
  return <ChannelGrid items={items} />;
}
