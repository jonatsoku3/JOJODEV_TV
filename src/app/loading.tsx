import { PageShell } from "@/components/page-shell";

export default function Loading() {
  return (
    <PageShell className="space-y-6">
      <div className="h-72 animate-pulse rounded-[2rem] bg-white/8" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/8" />
        ))}
      </div>
    </PageShell>
  );
}
