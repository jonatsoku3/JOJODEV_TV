import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-3xl border border-dashed border-amber-200/20 bg-gradient-to-br from-rose-500/10 to-violet-600/10 px-6 py-16 text-center",
        className
      )}
    >
      <Radio className="mb-4 size-8 text-amber-200" />
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
