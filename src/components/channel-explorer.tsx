"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChannelGrid } from "@/components/channel-grid";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COPY } from "@/lib/i18n";
import type { CategoryMeta, ChannelSummary, CountryMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

type Meta = {
  countries: CountryMeta[];
  categories: CategoryMeta[];
};

export function ChannelExplorer({
  initialQ = "",
  initialCountry = "",
  initialCategory = "",
  heading,
  lockCountry = false,
  lockCategory = false,
}: {
  initialQ?: string;
  initialCountry?: string;
  initialCategory?: string;
  heading?: string;
  lockCountry?: boolean;
  lockCategory?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ || searchParams.get("q") || "");
  const [country, setCountry] = useState(
    initialCountry || searchParams.get("country") || ""
  );
  const [category, setCategory] = useState(
    initialCategory || searchParams.get("category") || ""
  );
  const [items, setItems] = useState<ChannelSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);

  useEffect(() => {
    fetch("/api/meta")
      .then((res) => res.json())
      .then((data: Meta) => setMeta(data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (country && !lockCountry) params.set("country", country);
    if (category && !lockCategory) params.set("category", category);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [q, country, category, pathname, router, searchParams, lockCountry, lockCategory]);

  useEffect(() => {
    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({ limit: "48", offset: "0" });
        if (q) params.set("q", q);
        if (country) params.set("country", country);
        if (category) params.set("category", category);
        const res = await fetch(`/api/channels?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error("fail");
        const data = (await res.json()) as { items: ChannelSummary[]; total: number };
        setItems(data.items);
        setTotal(data.total);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [q, country, category]);

  const chipCountries = useMemo(() => meta?.countries.slice(0, 24) ?? [], [meta]);
  const allCountries = meta?.countries ?? [];
  const categories = meta?.categories ?? [];

  async function loadMore() {
    const params = new URLSearchParams({
      limit: "48",
      offset: String(items.length),
    });
    if (q) params.set("q", q);
    if (country) params.set("country", country);
    if (category) params.set("category", category);
    const res = await fetch(`/api/channels?${params}`);
    if (!res.ok) return;
    const data = (await res.json()) as { items: ChannelSummary[]; total: number };
    setItems((prev) => {
      const seen = new Set(prev.map((item) => item.id));
      return [...prev, ...data.items.filter((item) => !seen.has(item.id))];
    });
    setTotal(data.total);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-amber-200">{COPY.tagline}</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {heading || COPY.browse}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total.toLocaleString()} {COPY.channelsCount}
          </p>
        </div>
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={COPY.searchPlaceholder}
          className="h-11 w-full max-w-md rounded-full border-white/12 bg-white/8 px-4 text-base sm:h-10 sm:text-sm tv:h-12"
        />
      </div>

      {!lockCountry ? (
        <div className="space-y-2">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <FilterChip active={!country} onClick={() => setCountry("")}>
              {COPY.allCountries}
            </FilterChip>
            {chipCountries.map((item) => (
              <FilterChip
                key={item.code}
                active={country === item.code}
                onClick={() => setCountry(item.code === country ? "" : item.code)}
              >
                {item.flag} {item.nameLocal}
              </FilterChip>
            ))}
          </div>
          {allCountries.length ? (
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-11 max-w-xs rounded-full border border-white/12 bg-[#1a1228] px-3 text-base text-foreground sm:h-9 sm:text-sm"
              aria-label={COPY.countries}
            >
              <option value="">{COPY.allCountries}</option>
              {allCountries.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.nameLocal} ({item.count})
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}

      {!lockCategory ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={!category} onClick={() => setCategory("")}>
            {COPY.allCategories}
          </FilterChip>
          {categories.map((item) => (
            <FilterChip
              key={item.id}
              active={category === item.id}
              onClick={() => setCategory(item.id === category ? "" : item.id)}
            >
              {item.nameLocal}
            </FilterChip>
          ))}
        </div>
      ) : null}

      {error ? (
        <EmptyState title={COPY.errorTitle} body={COPY.errorBody} />
      ) : loading && !items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/6" />
          ))}
        </div>
      ) : items.length ? (
        <>
          {loading ? (
            <p className="text-xs text-muted-foreground">{COPY.loading}</p>
          ) : null}
          <ChannelGrid items={items} />
          {items.length < total ? (
            <div className="flex justify-center pt-2">
              <Button onClick={loadMore} variant="outline" className="rounded-full">
                {COPY.loadMore}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState title={COPY.emptyTitle} body={COPY.emptyBody} />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 shrink-0 rounded-full px-3.5 py-2 text-sm ring-1 transition tv:min-h-12 tv:px-4 tv:text-base",
        active
          ? "bg-gradient-to-r from-rose-500 to-amber-400 text-white ring-transparent"
          : "bg-white/6 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
