"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { COPY } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SearchForm({
  defaultValue = "",
  className,
  autoFocus = false,
}: {
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();

  return (
    <form
      className={cn("relative", className)}
      action="/search"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const q = String(form.get("q") || "").trim();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/browse");
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        defaultValue={defaultValue}
        placeholder={COPY.searchPlaceholder}
        autoFocus={autoFocus}
        className="h-10 rounded-full border-white/10 bg-white/6 pr-4 pl-10 text-sm md:text-sm"
      />
    </form>
  );
}
