import { COPY } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/jojo-dev-tv-logo.png"
        alt={COPY.brand}
        width={size === "lg" ? 256 : 64}
        height={size === "lg" ? 256 : 64}
        className={cn(
          "rounded-xl object-cover shadow-[0_0_28px_rgba(244,63,94,0.35)] ring-1 ring-amber-300/30",
          size === "lg"
            ? "h-28 w-28 sm:h-40 sm:w-40 lg:h-52 lg:w-52 tv:h-64 tv:w-64"
            : "h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14 tv:h-16 tv:w-16",
        )}
      />
      {size === "sm" ? <span className="sr-only">{COPY.brand}</span> : null}
    </span>
  );
}
