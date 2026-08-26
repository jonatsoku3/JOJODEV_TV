import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative grid size-8 place-items-center rounded-lg bg-primary shadow-[0_0_20px_color-mix(in_oklch,var(--primary),transparent_55%)]">
        <svg viewBox="0 0 24 24" className="size-4 fill-primary-foreground" aria-hidden>
          <path d="M8 6.8v10.4L18 12 8 6.8Z" />
        </svg>
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        Loka<span className="text-primary">TV</span>
      </span>
    </span>
  );
}
