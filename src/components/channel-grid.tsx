import { ChannelCard } from "@/components/channel-card";
import type { ChannelSummary } from "@/lib/types";

export function ChannelGrid({ items }: { items: ChannelSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} className="min-w-0" />
      ))}
    </div>
  );
}
