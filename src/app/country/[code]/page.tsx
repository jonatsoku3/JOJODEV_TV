import { ChannelExplorer } from "@/components/channel-explorer";
import { getCatalog } from "@/lib/catalog";
import { countryName } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const catalog = await getCatalog();
  const country = catalog.countries.find((item) => item.code === code.toUpperCase());
  if (!country) notFound();

  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
      <ChannelExplorer
        heading={`${country.flag} ${countryName(country.code, country.name)}`}
        initialCountry={country.code}
        lockCountry
      />
    </Suspense>
  );
}
