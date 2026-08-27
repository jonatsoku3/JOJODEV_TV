import Link from "next/link";
import { ChannelCard } from "@/components/channel-card";
import { COPY } from "@/lib/i18n";
import { ROW_ACCENT } from "@/lib/palette";
import type { ChannelSummary } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChannelRow({
  title,
  href,
  items,
  accent,
}: {
  title: string;
  href?: string;
  items: ChannelSummary[];
  accent?: string;
}) {
  if (!items.length) return null;
  const bar = accent ? ROW_ACCENT[accent] : "from-rose-400 to-amber-300";
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight sm:text-xl tv:text-2xl">
          <span className={cn("h-5 w-1.5 rounded-full bg-gradient-to-b", bar)} />
          {title}
        </h2>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-sm text-muted-foreground transition hover:text-amber-200"
          >
            {COPY.allChannels}
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((channel, index) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            priority={index < 3}
            className="w-[min(72vw,280px)] shrink-0 sm:w-[min(38vw,240px)] md:w-[220px] lg:w-[236px] xl:w-[252px] tv:w-[300px]"
          />
        ))}
      </div>
    </section>
  );
}
