import Link from "next/link";
import { ChannelLogo } from "@/components/channel-logo";
import { COPY } from "@/lib/i18n";
import type { ChannelSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export function ChannelCard({
  channel,
  className,
}: {
  channel: ChannelSummary;
  className?: string;
}) {
  return (
    <Link
      href={`/watch/${encodeURIComponent(channel.id)}`}
      className={cn("group block w-full min-w-0 snap-start", className)}
    >
      <article className="overflow-hidden rounded-2xl bg-white/4 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:ring-amber-200/50 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] focus-within:ring-amber-200/60 touch:hover:translate-y-0">
        <div className="relative aspect-[16/10]">
          <ChannelLogo name={channel.name} logo={channel.logo} seed={channel.id} className="size-full" />
          <span className="live-pulse absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase">
            <span className="size-1.5 rounded-full bg-white" />
            {COPY.live}
          </span>
          {channel.quality ? (
            <span className="absolute right-2 bottom-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-amber-100">
              {channel.quality}
            </span>
          ) : null}
          <span className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/30 group-focus-visible:bg-black/30">
            <span className="grid size-11 place-items-center rounded-full bg-white text-black opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 touch:opacity-100 touch:bg-white/80">
              <Play className="size-5 fill-current" />
            </span>
          </span>
        </div>
        <div className="space-y-1 px-3 py-2.5">
          <h3 className="line-clamp-1 text-sm font-medium text-foreground tv:text-base">{channel.name}</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground tv:text-sm">
            {channel.flag} {channel.countryNameLocal}
          </p>
        </div>
      </article>
    </Link>
  );
}
