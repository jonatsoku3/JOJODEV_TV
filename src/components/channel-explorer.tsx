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
  const [q, setQ] = useState(initialQ);
  const [country, setCountry] = useState(initialCountry);
  const [category, setCategory] = useState(initialCategory);
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
    if (country) params.set("country", country);
    if (category) params.set("category", category);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [q, country, category, pathname, router, searchParams]);

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({ limit: "48", offset: "0" });
        if (q) params.set("q", q);
        if (country) params.set("country", country);
        if (category) params.set("category", category);
        const res = await fetch(`/api/channels?${params}`);
        if (!res.ok) throw new Error("fail");
        const data = (await res.json()) as { items: ChannelSummary[]; total: number };
        setItems(data.items);
        setTotal(data.total);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => window.clearTimeout(handle);
  }, [q, country, category]);

  const countries = useMemo(() => meta?.countries.slice(0, 28) ?? [], [meta]);
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
    setItems((prev) => [...prev, ...data.items]);
    setTotal(data.total);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
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
          className="h-10 max-w-md rounded-full border-white/10 bg-white/6 px-4"
        />
      </div>

      {!lockCountry ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={!country} onClick={() => setCountry("")}>
            {COPY.allCountries}
          </FilterChip>
          {countries.map((item) => (
            <FilterChip
              key={item.code}
              active={country === item.code}
              onClick={() => setCountry(item.code === country ? "" : item.code)}
            >
              {item.flag} {item.nameLocal}
            </FilterChip>
          ))}
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
        "shrink-0 rounded-full px-3 py-1.5 text-sm ring-1 transition",
        active
          ? "bg-primary text-primary-foreground ring-primary"
          : "bg-white/4 text-muted-foreground ring-white/10 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
