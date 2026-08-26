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
  onNavigate,
}: {
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
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
        onNavigate?.();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/browse");
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        defaultValue={defaultValue}
        placeholder={COPY.searchPlaceholder}
        autoFocus={autoFocus}
        className="h-10 rounded-full border-white/12 bg-white/8 pr-4 pl-10 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:text-sm"
      />
    </form>
  );
}
