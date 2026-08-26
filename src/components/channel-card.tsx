import Link from "next/link";
import { ChannelLogo } from "@/components/channel-logo";
import { Badge } from "@/components/ui/badge";
import { COPY } from "@/lib/i18n";
import type { ChannelSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

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
      className={cn(
        "group block min-w-[148px] snap-start sm:min-w-[176px]",
        className
      )}
    >
      <article className="overflow-hidden rounded-2xl bg-card ring-1 ring-white/8 transition duration-200 group-hover:-translate-y-0.5 group-hover:ring-primary/50">
        <div className="relative aspect-[16/10]">
          <ChannelLogo name={channel.name} logo={channel.logo} className="size-full" />
          <Badge className="absolute top-2 left-2 bg-primary text-[10px] tracking-wider uppercase">
            {COPY.live}
          </Badge>
          {channel.quality ? (
            <span className="absolute right-2 bottom-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
              {channel.quality}
            </span>
          ) : null}
        </div>
        <div className="space-y-1 px-3 py-2.5">
          <h3 className="line-clamp-1 font-medium text-foreground">{channel.name}</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {channel.flag} {channel.countryNameLocal}
          </p>
        </div>
      </article>
    </Link>
  );
}
