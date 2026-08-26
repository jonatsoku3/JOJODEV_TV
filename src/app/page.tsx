import { ChannelRow } from "@/components/channel-row";
import { HeroShowcase } from "@/components/hero-showcase";
import { LibraryRows } from "@/components/library-rows";
import { getCatalog, getFeatured } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const catalog = await getCatalog();
  const featured = getFeatured(catalog);

  return (
    <div className="space-y-10">
      {featured.hero ? (
        <HeroShowcase channel={featured.hero} stats={catalog.stats} />
      ) : null}
      <LibraryRows />
      {featured.rows.map((row) => (
        <ChannelRow key={row.key} title={row.title} href={row.href} items={row.items} />
      ))}
    </div>
  );
}
