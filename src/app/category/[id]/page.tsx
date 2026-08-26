import { ChannelExplorer } from "@/components/channel-explorer";
import { PageShell } from "@/components/page-shell";
import { getCatalog } from "@/lib/catalog";
import { categoryName } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catalog = await getCatalog();
  const category = catalog.categories.find((item) => item.id === id);
  if (!category) notFound();

  return (
    <PageShell>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/8" />}>
        <ChannelExplorer
          heading={categoryName(category.id, category.name)}
          initialCategory={category.id}
          lockCategory
        />
      </Suspense>
    </PageShell>
  );
}
