import Link from "next/link";
import type { CountryMeta } from "@/lib/types";
import { COPY } from "@/lib/i18n";
import { hueFromId } from "@/lib/palette";
import { ChevronRight } from "lucide-react";

export function CountryStrip({ countries }: { countries: CountryMeta[] }) {
  if (!countries.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="font-heading text-xl font-semibold tracking-tight">{COPY.countries}</h2>
        <Link
          href="/countries"
          className="inline-flex items-center gap-0.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          {COPY.allChannels}
          <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {countries.map((country) => (
          <Link
            key={country.code}
            href={`/country/${country.code}`}
            className="group flex min-h-12 min-w-[148px] snap-start items-center gap-3 rounded-2xl px-3 py-2.5 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-amber-300/40 tv:min-w-[200px]"
            style={{
              background: `linear-gradient(145deg, oklch(0.32 0.09 ${hueFromId(country.code)} / 0.5), oklch(0.2 0.04 292 / 0.88))`,
            }}
          >
            <span className="text-2xl drop-shadow">{country.flag}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{country.nameLocal}</span>
              <span className="block text-[11px] text-muted-foreground">
                {country.count.toLocaleString()} {COPY.channelsCount}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
