import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { COPY } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: COPY.countries };

export default async function CountriesPage() {
  const catalog = await getCatalog();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{COPY.countries}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {catalog.stats.countries.toLocaleString()} {COPY.countriesCount} ·{" "}
          {catalog.stats.channels.toLocaleString()} {COPY.channelsCount}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {catalog.countries.map((country) => (
          <Link
            key={country.code}
            href={`/country/${country.code}`}
            className="rounded-2xl bg-card p-4 ring-1 ring-white/8 transition hover:-translate-y-0.5 hover:ring-primary/40"
          >
            <p className="text-2xl">{country.flag}</p>
            <p className="mt-2 font-medium">{country.nameLocal}</p>
            <p className="text-xs text-muted-foreground">
              {country.name} · {country.count.toLocaleString()} {COPY.channelsCount}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
