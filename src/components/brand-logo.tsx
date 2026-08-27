import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 via-primary to-amber-400 shadow-[0_0_24px_oklch(0.7_0.2_18_/_0.55)]">
        <svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden>
          <path d="M8 6.8v10.4L18 12 8 6.8Z" />
        </svg>
      </span>
      <span className="font-heading text-[15px] font-semibold tracking-tight sm:text-lg">
        JOJO DEV{" "}
        <span className="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
          TV
        </span>
      </span>
    </span>
  );
}
