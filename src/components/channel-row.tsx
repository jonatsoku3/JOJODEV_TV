import Link from "next/link";
import { ChannelCard } from "@/components/channel-card";
import { COPY } from "@/lib/i18n";
import type { ChannelSummary } from "@/lib/types";
import { ChevronRight } from "lucide-react";

export function ChannelRow({
  title,
  href,
  items,
}: {
  title: string;
  href?: string;
  items: ChannelSummary[];
}) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            {COPY.allChannels}
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </section>
  );
}
