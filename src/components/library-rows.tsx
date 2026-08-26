"use client";

import { useEffect, useState } from "react";
import { ChannelRow } from "@/components/channel-row";
import { EmptyState } from "@/components/empty-state";
import { useLibrary } from "@/hooks/use-library";
import { COPY } from "@/lib/i18n";
import type { ChannelSummary } from "@/lib/types";

async function fetchByIds(ids: string[]) {
  if (!ids.length) return [] as ChannelSummary[];
  const res = await fetch(`/api/channels?ids=${ids.map(encodeURIComponent).join(",")}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: ChannelSummary[] };
  return data.items;
}

export function LibraryRows({
  showFavorites = true,
  showRecent = true,
  empty = false,
}: {
  showFavorites?: boolean;
  showRecent?: boolean;
  empty?: boolean;
}) {
  const { ready, favoriteIds, recentIds } = useLibrary();
  const [favorites, setFavorites] = useState<ChannelSummary[]>([]);
  const [recent, setRecent] = useState<ChannelSummary[]>([]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    if (showFavorites) {
      fetchByIds(favoriteIds).then((data) => {
        if (!cancelled) setFavorites(data);
      });
    }
    if (showRecent) {
      fetchByIds(recentIds).then((data) => {
        if (!cancelled) setRecent(data);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [ready, favoriteIds, recentIds, showFavorites, showRecent]);

  if (!ready) return null;

  return (
    <div className="space-y-10">
      {showRecent ? (
        recent.length ? (
          <ChannelRow title={COPY.recent} items={recent} />
        ) : empty ? (
          <EmptyState title={COPY.emptyRecent} body={COPY.emptyFavoritesBody} />
        ) : null
      ) : null}
      {showFavorites ? (
        favorites.length ? (
          <ChannelRow title={COPY.favorites} href="/favorites" items={favorites} />
        ) : empty ? (
          <EmptyState title={COPY.emptyFavorites} body={COPY.emptyFavoritesBody} />
        ) : null
      ) : null}
    </div>
  );
}

