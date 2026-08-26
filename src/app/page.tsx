import { ChannelRow } from "@/components/channel-row";
import { CountryStrip } from "@/components/country-strip";
import { HeroShowcase } from "@/components/hero-showcase";
import { LibraryRows } from "@/components/library-rows";
import { PageShell } from "@/components/page-shell";
import { getCatalog, getFeatured } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const catalog = await getCatalog();
  const featured = getFeatured(catalog);

  return (
    <div>
      {featured.hero ? (
        <HeroShowcase channel={featured.hero} stats={catalog.stats} />
      ) : null}
      <PageShell className="space-y-10 pt-8">
        <CountryStrip countries={catalog.countries.slice(0, 12)} />
        <LibraryRows />
        {featured.rows.map((row) => (
          <ChannelRow
            key={row.key}
            title={row.title}
            href={row.href}
            items={row.items}
            accent={row.key}
          />
        ))}
      </PageShell>
    </div>
  );
}
