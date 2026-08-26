import { ChannelExplorer } from "@/components/channel-explorer";
import { COPY } from "@/lib/i18n";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string; category?: string }>;
}) {
  const sp = await searchParams;
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
      <ChannelExplorer
        heading={COPY.browse}
        initialQ={sp.q ?? ""}
        initialCountry={sp.country ?? ""}
        initialCategory={sp.category ?? ""}
      />
    </Suspense>
  );
}
