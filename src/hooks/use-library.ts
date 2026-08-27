"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const FAVORITES_KEY = "jojodevtv:favorites";
const RECENT_KEY = "jojodevtv:recent";
const LEGACY_FAVORITES_KEY = "lokatv:favorites";
const LEGACY_RECENT_KEY = "lokatv:recent";
const MAX_RECENT = 24;

type RecentItem = { id: string; at: number };

let favorites: string[] = [];
let recent: RecentItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function hydrate() {
  favorites = readJson<string[]>(FAVORITES_KEY, readJson<string[]>(LEGACY_FAVORITES_KEY, []));
  recent = readJson<RecentItem[]>(RECENT_KEY, readJson<RecentItem[]>(LEGACY_RECENT_KEY, []));
}

if (typeof window !== "undefined") {
  hydrate();
  window.addEventListener("storage", (event) => {
    if (event.key === FAVORITES_KEY || event.key === RECENT_KEY) {
      hydrate();
      emit();
    }
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  emit();
}

export function toggleFavorite(id: string) {
  favorites = favorites.includes(id) ? favorites.filter((item) => item !== id) : [id, ...favorites];
  persist();
}

export function addRecent(id: string) {
  recent = [{ id, at: Date.now() }, ...recent.filter((item) => item.id !== id)].slice(0, MAX_RECENT);
  persist();
}

function getSnapshot() {
  return `${favorites.join("|")}::${recent.map((r) => r.id).join("|")}`;
}

export function useLibrary() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const ready = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  const favoriteIds = useMemo(
    () => (snapshot.split("::")[0] ? snapshot.split("::")[0].split("|") : []),
    [snapshot]
  );
  const recentIds = useMemo(
    () => (snapshot.split("::")[1] ? snapshot.split("::")[1].split("|") : []),
    [snapshot]
  );

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  return {
    ready,
    favoriteIds,
    recentIds,
    isFavorite,
    toggleFavorite,
    addRecent,
  };
}
