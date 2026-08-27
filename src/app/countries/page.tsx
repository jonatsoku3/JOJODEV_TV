import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getCatalog } from "@/lib/catalog";
import { COPY } from "@/lib/i18n";
import { hueFromId } from "@/lib/palette";

export const dynamic = "force-dynamic";
export const metadata = { title: COPY.countries };

export default async function CountriesPage() {
  const catalog = await getCatalog();
  return (
    <PageShell className="space-y-7">
      <div>
        <p className="text-sm font-medium text-amber-200">{COPY.tagline}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {COPY.countries}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {catalog.stats.countries.toLocaleString()} {COPY.countriesCount} ·{" "}
          {catalog.stats.channels.toLocaleString()} {COPY.channelsCount}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 tv:grid-cols-7">
        {catalog.countries.map((country) => {
          const hue = hueFromId(country.code);
          return (
            <Link
              key={country.code}
              href={`/country/${country.code}`}
              className="group min-h-24 overflow-hidden rounded-2xl p-4 ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-amber-200/45 focus-visible:ring-amber-200/60"
              style={{
                background: `linear-gradient(160deg, oklch(0.32 0.1 ${hue} / 0.55), oklch(0.2 0.04 292 / 0.9))`,
              }}
            >
              <p className="text-3xl drop-shadow">{country.flag}</p>
              <p className="mt-3 font-medium">{country.nameLocal}</p>
              <p className="text-xs text-white/60">
                {country.name} · {country.count.toLocaleString()} {COPY.channelsCount}
              </p>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
