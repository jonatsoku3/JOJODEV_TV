import { ChannelExplorer } from "@/components/channel-explorer";
import { COPY } from "@/lib/i18n";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
      <ChannelExplorer heading={`${COPY.searchResults}${q ? ` · ${q}` : ""}`} initialQ={q} />
    </Suspense>
  );
}
