import { ChannelRow } from "@/components/channel-row";
import { FavoriteButton } from "@/components/favorite-button";
import { LivePlayer } from "@/components/player";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { getCatalog, getChannel, relatedChannels } from "@/lib/catalog";
import { COPY, categoryName } from "@/lib/i18n";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catalog = await getCatalog();
  const channel = getChannel(catalog, id);
  return { title: channel?.name ?? COPY.brand };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catalog = await getCatalog();
  const channel = getChannel(catalog, id);
  if (!channel) notFound();
  const related = relatedChannels(catalog, channel);

  return (
    <PageShell className="space-y-8">
      <LivePlayer key={channel.id} channelId={channel.id} streams={channel.streams} />
      <div className="flex flex-col gap-4 rounded-3xl bg-white/4 p-5 ring-1 ring-white/10 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="live-pulse bg-primary uppercase">{COPY.live}</Badge>
            {channel.quality ? (
              <Badge className="border-0 bg-amber-300/15 text-amber-100">{channel.quality}</Badge>
            ) : null}
            <Badge variant="outline" className="border-white/15">
              {COPY.streams} {channel.streamCount}
            </Badge>
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{channel.name}</h1>
          <p className="text-muted-foreground">
            <Link href={`/country/${channel.country}`} className="hover:text-amber-200">
              {channel.flag} {channel.countryNameLocal}
            </Link>
            {channel.network ? ` · ${channel.network}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {channel.categories.map((category) => (
              <Link key={category} href={`/category/${category}`}>
                <Badge className="border-0 bg-violet-400/15 text-violet-100">
                  {categoryName(category, category)}
                </Badge>
              </Link>
            ))}
          </div>
          {channel.website ? (
            <a
              href={channel.website}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-amber-200 hover:underline"
            >
              {COPY.website}
            </a>
          ) : null}
          <p className="text-xs text-muted-foreground">{COPY.playerHint}</p>
        </div>
        <FavoriteButton id={channel.id} />
      </div>
      <ChannelRow title={COPY.related} items={related} accent="entertainment" />
    </PageShell>
  );
}
