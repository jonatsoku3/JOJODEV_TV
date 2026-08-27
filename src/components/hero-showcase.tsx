import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";
import { ChannelLogo } from "@/components/channel-logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import type { ChannelSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Globe2, Play, Radio, Sparkles } from "lucide-react";

export function HeroShowcase({
  channel,
  stats,
}: {
  channel: ChannelSummary;
  stats: { channels: number; countries: number };
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/25 via-violet-700/15 to-amber-400/10" />
        <div className="absolute top-10 left-[12%] size-64 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="absolute right-[8%] bottom-0 size-80 rounded-full bg-amber-300/15 blur-3xl" />
      </div>
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-16">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="live-pulse h-6 gap-1.5 rounded-full bg-primary px-3 text-[11px] tracking-[0.18em] uppercase">
              <span className="size-1.5 rounded-full bg-white" />
              {COPY.live}
            </Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1 text-xs text-amber-200 ring-1 ring-amber-200/20">
              <Sparkles className="size-3.5" />
              {COPY.featuredNow}
            </span>
          </div>
          <div>
            <BrandMark size="lg" />
            <p className="mt-4 text-sm font-medium text-rose-200/90">{COPY.tagline}</p>
            <h1 className="mt-2 max-w-xl font-heading text-3xl font-semibold tracking-tight sm:text-5xl">
              <span className="mt-1 block text-white/90">
                {channel.countryNameLocal} · {channel.name}
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">{COPY.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/6 px-4 py-3 ring-1 ring-white/10">
              <p className="font-heading text-2xl font-semibold text-amber-200">
                {stats.channels.toLocaleString()}
              </p>
              <p className="text-xs text-white/60">{COPY.channelsCount}</p>
            </div>
            <div className="rounded-2xl bg-white/6 px-4 py-3 ring-1 ring-white/10">
              <p className="font-heading text-2xl font-semibold text-cyan-200">
                {stats.countries.toLocaleString()}
              </p>
              <p className="flex items-center gap-1 text-xs text-white/60">
                <Globe2 className="size-3" />
                {COPY.countriesCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white/6 px-4 py-3 ring-1 ring-white/10">
              <p className="inline-flex items-center gap-1.5 font-heading text-2xl font-semibold text-rose-200">
                <Radio className="size-5" />
                24/7
              </p>
              <p className="text-xs text-white/60">{COPY.playing}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/watch/${encodeURIComponent(channel.id)}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full bg-primary px-6 text-sm shadow-[0_10px_40px_oklch(0.7_0.2_18_/_0.45)] hover:bg-primary/90"
              )}
            >
              <Play className="size-4 fill-current" />
              {COPY.watchNow} · {channel.name}
            </Link>
            <Link
              href="/browse"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 rounded-full border-white/20 bg-white/5 px-6 text-sm backdrop-blur"
              )}
            >
              {COPY.browse}
            </Link>
          </div>
        </div>
        <Link href={`/watch/${encodeURIComponent(channel.id)}`} className="group block">
          <div className="float-slow relative overflow-hidden rounded-[1.75rem] bg-black/30 p-1 ring-1 ring-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="relative overflow-hidden rounded-[1.4rem]">
              <ChannelLogo
                name={channel.name}
                logo={channel.logo}
                seed={channel.id}
                className="aspect-[16/10] w-full"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/25">
                <span className="grid size-16 place-items-center rounded-full bg-white/90 text-black opacity-0 shadow-xl transition group-hover:opacity-100">
                  <Play className="size-7 fill-current" />
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{channel.name}</p>
                <p className="text-sm text-white/60">
                  {channel.flag} {channel.countryNameLocal}
                </p>
              </div>
              <Badge className="bg-primary">{COPY.live}</Badge>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
