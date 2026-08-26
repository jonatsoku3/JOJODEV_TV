import Link from "next/link";
import { ChannelLogo } from "@/components/channel-logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import type { ChannelSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export function HeroShowcase({
  channel,
  stats,
}: {
  channel: ChannelSummary;
  stats: { channels: number; countries: number };
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#141728] ring-1 ring-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_70%),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.25),transparent_36%)]" />
      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-5">
          <Badge className="bg-primary tracking-wide uppercase">{COPY.live}</Badge>
          <div>
            <p className="text-sm text-primary/90">{COPY.tagline}</p>
            <h1 className="mt-2 max-w-xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              {COPY.brand} · {channel.countryNameLocal}
            </h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">{COPY.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="font-heading text-2xl font-semibold text-foreground">
                {stats.channels.toLocaleString()}
              </p>
              <p className="text-muted-foreground">{COPY.channelsCount}</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-semibold text-foreground">
                {stats.countries.toLocaleString()}
              </p>
              <p className="text-muted-foreground">{COPY.countriesCount}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/watch/${encodeURIComponent(channel.id)}`}
              className={cn(buttonVariants({ size: "lg" }), "h-10 rounded-full px-5")}
            >
              <Play className="size-4 fill-current" />
              {COPY.watchNow} · {channel.name}
            </Link>
            <Link
              href="/browse"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 rounded-full px-5")}
            >
              {COPY.browse}
            </Link>
          </div>
        </div>
        <Link href={`/watch/${encodeURIComponent(channel.id)}`} className="block">
          <div className="overflow-hidden rounded-3xl bg-black/30 ring-1 ring-white/10">
            <ChannelLogo name={channel.name} logo={channel.logo} className="aspect-[16/10] w-full" />
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{channel.name}</p>
                <p className="text-sm text-muted-foreground">
                  {channel.flag} {channel.countryNameLocal}
                </p>
              </div>
              <Badge variant="secondary">{COPY.live}</Badge>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
